/**
 * Regulatory Feed Service
 * 
 * Fetches and parses real RSS feeds from UK regulatory bodies.
 * Stores updates in the database and triggers gap analysis.
 */

import { getDb } from "./db";
import { regulatoryUpdates } from "../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { createAuditEntryWithHash } from "./auditCache";

// UK Regulatory RSS Feed URLs
const REGULATORY_FEEDS = {
  FCA: {
    name: 'Financial Conduct Authority',
    feeds: [
      { url: 'https://www.fca.org.uk/news/rss.xml', type: 'news' },
      { url: 'https://www.fca.org.uk/publications/policy-statements/rss.xml', type: 'policy' },
    ],
    jurisdiction: 'UK',
  },
  PRA: {
    name: 'Prudential Regulation Authority',
    feeds: [
      { url: 'https://www.bankofengland.co.uk/rss/news', type: 'news' },
    ],
    jurisdiction: 'UK',
  },
  BOE: {
    name: 'Bank of England',
    feeds: [
      { url: 'https://www.bankofengland.co.uk/rss/publications', type: 'publications' },
    ],
    jurisdiction: 'UK',
  },
  ICO: {
    name: 'Information Commissioner\'s Office',
    feeds: [
      { url: 'https://ico.org.uk/about-the-ico/news-and-events/news-and-blogs/rss/', type: 'news' },
    ],
    jurisdiction: 'UK',
  },
};

interface FeedItem {
  title: string;
  summary: string;
  link: string;
  pubDate: Date;
  source: string;
  regulatoryBody: string;
}

/**
 * Parse RSS XML to extract feed items
 */
function parseRSSXML(xml: string, source: string, regulatoryBody: string): FeedItem[] {
  const items: FeedItem[] = [];
  
  // Simple XML parsing for RSS items
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  
  for (const itemXml of itemMatches) {
    const title = extractXMLTag(itemXml, 'title');
    const description = extractXMLTag(itemXml, 'description');
    const link = extractXMLTag(itemXml, 'link');
    const pubDate = extractXMLTag(itemXml, 'pubDate');
    
    if (title) {
      items.push({
        title: cleanHTMLEntities(title),
        summary: cleanHTMLEntities(description || ''),
        link: link || '',
        pubDate: pubDate ? new Date(pubDate) : new Date(),
        source,
        regulatoryBody,
      });
    }
  }
  
  return items;
}

/**
 * Extract content from XML tag
 */
function extractXMLTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : null;
}

/**
 * Clean HTML entities from text
 */
function cleanHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
}

/**
 * Determine impact level based on keywords
 */
function determineImpactLevel(title: string, summary: string): 'low' | 'medium' | 'high' | 'critical' {
  const text = `${title} ${summary}`.toLowerCase();
  
  // Critical keywords
  if (text.includes('enforcement') || text.includes('fine') || text.includes('penalty') || 
      text.includes('breach') || text.includes('urgent') || text.includes('immediate')) {
    return 'critical';
  }
  
  // High impact keywords
  if (text.includes('new rules') || text.includes('regulation') || text.includes('requirement') ||
      text.includes('mandatory') || text.includes('compliance') || text.includes('deadline')) {
    return 'high';
  }
  
  // Medium impact keywords
  if (text.includes('guidance') || text.includes('consultation') || text.includes('review') ||
      text.includes('update') || text.includes('amendment')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Fetch RSS feed from URL
 */
async function fetchFeed(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RegulaSync/1.0 (Regulatory Compliance Platform)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch feed ${url}: ${response.status}`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.warn(`Error fetching feed ${url}:`, error);
    return null;
  }
}

/**
 * Fetch updates from a specific regulatory body
 */
export async function fetchRegulatoryUpdates(body: keyof typeof REGULATORY_FEEDS): Promise<{
  fetched: number;
  new: number;
  errors: string[];
}> {
  const config = REGULATORY_FEEDS[body];
  if (!config) {
    return { fetched: 0, new: 0, errors: [`Unknown regulatory body: ${body}`] };
  }
  
  const db = await getDb();
  if (!db) {
    return { fetched: 0, new: 0, errors: ['Database not available'] };
  }
  
  let totalFetched = 0;
  let totalNew = 0;
  const errors: string[] = [];
  
  for (const feed of config.feeds) {
    try {
      const xml = await fetchFeed(feed.url);
      if (!xml) {
        errors.push(`Failed to fetch ${feed.url}`);
        continue;
      }
      
      const items = parseRSSXML(xml, feed.type, body);
      totalFetched += items.length;
      
      for (const item of items) {
        // Check if this update already exists (by title and source)
        const existing = await db.select()
          .from(regulatoryUpdates)
          .where(
            and(
              eq(regulatoryUpdates.title, item.title.substring(0, 256)),
              eq(regulatoryUpdates.regulatoryBody, body)
            )
          )
          .limit(1);
        
        if (existing.length === 0) {
          // Insert new update
          await db.insert(regulatoryUpdates).values({
            title: item.title.substring(0, 256),
            summary: item.summary.substring(0, 2000) || null,
            source: item.source,
            sourceUrl: item.link || null,
            regulatoryBody: body,
            jurisdiction: config.jurisdiction,
            effectiveDate: item.pubDate,
            impactLevel: determineImpactLevel(item.title, item.summary),
            status: 'new',
          });
          totalNew++;
        }
      }
    } catch (error) {
      errors.push(`Error processing ${feed.url}: ${error}`);
    }
  }
  
  return { fetched: totalFetched, new: totalNew, errors };
}

/**
 * Fetch updates from all regulatory bodies
 */
export async function fetchAllRegulatoryUpdates(): Promise<{
  totalFetched: number;
  totalNew: number;
  bySource: Record<string, { fetched: number; new: number }>;
  errors: string[];
}> {
  const results = {
    totalFetched: 0,
    totalNew: 0,
    bySource: {} as Record<string, { fetched: number; new: number }>,
    errors: [] as string[],
  };
  
  for (const body of Object.keys(REGULATORY_FEEDS) as Array<keyof typeof REGULATORY_FEEDS>) {
    const result = await fetchRegulatoryUpdates(body);
    results.totalFetched += result.fetched;
    results.totalNew += result.new;
    results.bySource[body] = { fetched: result.fetched, new: result.new };
    results.errors.push(...result.errors);
  }
  
  // Create audit entry for the sync
  const db = await getDb();
  if (db && results.totalNew > 0) {
    await createAuditEntryWithHash(db, {
      action: 'create',
      entityType: 'regulatory_update',
      entityId: 0,
    });
  }
  
  return results;
}

/**
 * Get recent regulatory updates from the database
 */
export async function getRecentUpdates(options?: {
  limit?: number;
  source?: string;
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
  daysBack?: number;
}): Promise<typeof regulatoryUpdates.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  
  const { limit = 50, source, impactLevel, daysBack = 30 } = options || {};
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  let query = db.select()
    .from(regulatoryUpdates)
    .where(gte(regulatoryUpdates.createdAt, cutoffDate))
    .orderBy(desc(regulatoryUpdates.createdAt))
    .limit(limit);
  
  return await query;
}

/**
 * Get feed status for all regulatory bodies
 */
export async function getFeedStatus(): Promise<{
  feeds: Array<{
    body: string;
    name: string;
    lastUpdate: Date | null;
    totalUpdates: number;
    status: 'connected' | 'error' | 'unknown';
  }>;
}> {
  const db = await getDb();
  if (!db) return { feeds: [] };
  
  const feeds = [];
  
  for (const [body, config] of Object.entries(REGULATORY_FEEDS)) {
    const updates = await db.select()
      .from(regulatoryUpdates)
      .where(eq(regulatoryUpdates.regulatoryBody, body))
      .orderBy(desc(regulatoryUpdates.createdAt))
      .limit(1);
    
    const totalCount = await db.select()
      .from(regulatoryUpdates)
      .where(eq(regulatoryUpdates.regulatoryBody, body));
    
    feeds.push({
      body,
      name: config.name,
      lastUpdate: updates.length > 0 ? updates[0].createdAt : null,
      totalUpdates: totalCount.length,
      status: updates.length > 0 ? 'connected' as const : 'unknown' as const,
    });
  }
  
  return { feeds };
}

/**
 * Mark an update as reviewed
 */
export async function markUpdateReviewed(updateId: number, userId: number, status: 'under_review' | 'action_required' | 'implemented' | 'not_applicable'): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    await db.update(regulatoryUpdates)
      .set({ status, updatedAt: new Date() })
      .where(eq(regulatoryUpdates.id, updateId));
    
    await createAuditEntryWithHash(db, {
      userId,
      action: 'update',
      entityType: 'regulatory_update',
      entityId: updateId,
    });
    
    return true;
  } catch (error) {
    console.error('Error marking update as reviewed:', error);
    return false;
  }
}

/**
 * Get statistics about regulatory updates
 */
export async function getUpdateStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byImpact: Record<string, number>;
  bySource: Record<string, number>;
  lastWeek: number;
  lastMonth: number;
}> {
  const db = await getDb();
  if (!db) return {
    total: 0,
    byStatus: {},
    byImpact: {},
    bySource: {},
    lastWeek: 0,
    lastMonth: 0,
  };
  
  const allUpdates = await db.select().from(regulatoryUpdates);
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const byStatus: Record<string, number> = {};
  const byImpact: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let lastWeek = 0;
  let lastMonth = 0;
  
  for (const update of allUpdates) {
    byStatus[update.status] = (byStatus[update.status] || 0) + 1;
    byImpact[update.impactLevel] = (byImpact[update.impactLevel] || 0) + 1;
    if (update.regulatoryBody) {
      bySource[update.regulatoryBody] = (bySource[update.regulatoryBody] || 0) + 1;
    }
    
    if (update.createdAt >= weekAgo) lastWeek++;
    if (update.createdAt >= monthAgo) lastMonth++;
  }
  
  return {
    total: allUpdates.length,
    byStatus,
    byImpact,
    bySource,
    lastWeek,
    lastMonth,
  };
}
