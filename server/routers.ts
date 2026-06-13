import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
  }),

  // Policies
  policies: router({
    list: protectedProcedure.query(async () => {
      return await db.getPolicies();
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPolicyById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.enum(["compliance", "risk_management", "data_protection", "financial", "operational", "hr", "it_security", "environmental"]),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        departmentScope: z.string().optional(),
        automationEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createPolicy({
          ...input,
          ownerId: ctx.user.id,
          status: "draft",
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "pending_review", "approved", "active", "archived"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        automationEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updatePolicy(id, data);
      }),

    // Policy Versioning - Create new version
    createVersion: protectedProcedure
      .input(z.object({
        policyId: z.number(),
        changeDescription: z.string(),
        content: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createPolicyVersion } = await import('./policyVersioning');
        return await createPolicyVersion({
          policyId: input.policyId,
          userId: ctx.user.id,
          changeDescription: input.changeDescription,
          content: input.content,
        });
      }),

    // Get version history
    getVersionHistory: protectedProcedure
      .input(z.object({ policyId: z.number() }))
      .query(async ({ input }) => {
        const { getPolicyVersionHistory } = await import('./policyVersioning');
        return await getPolicyVersionHistory(input.policyId);
      }),

    // Get specific version
    getVersion: protectedProcedure
      .input(z.object({ policyId: z.number(), version: z.number() }))
      .query(async ({ input }) => {
        const { getPolicyVersion } = await import('./policyVersioning');
        return await getPolicyVersion(input.policyId, input.version);
      }),

    // Compare versions
    compareVersions: protectedProcedure
      .input(z.object({ policyId: z.number(), version1: z.number(), version2: z.number() }))
      .query(async ({ input }) => {
        const { comparePolicyVersions } = await import('./policyVersioning');
        return await comparePolicyVersions(input.policyId, input.version1, input.version2);
      }),

    // Restore version
    restoreVersion: protectedProcedure
      .input(z.object({ policyId: z.number(), version: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { restorePolicyVersion } = await import('./policyVersioning');
        return await restorePolicyVersion({
          policyId: input.policyId,
          version: input.version,
          userId: ctx.user.id,
        });
      }),

    // Approve version
    approveVersion: protectedProcedure
      .input(z.object({ policyId: z.number(), version: z.number(), comments: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { approvePolicyVersion } = await import('./policyVersioning');
        return await approvePolicyVersion({
          policyId: input.policyId,
          version: input.version,
          userId: ctx.user.id,
          comments: input.comments,
        });
      }),

    // Publish version
    publishVersion: protectedProcedure
      .input(z.object({ policyId: z.number(), version: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { publishPolicyVersion } = await import('./policyVersioning');
        return await publishPolicyVersion({
          policyId: input.policyId,
          version: input.version,
          userId: ctx.user.id,
        });
      }),

    // Get policy with versions
    getWithVersions: protectedProcedure
      .input(z.object({ policyId: z.number() }))
      .query(async ({ input }) => {
        const { getPolicyWithVersions } = await import('./policyVersioning');
        return await getPolicyWithVersions(input.policyId);
      }),
  }),

  // Delegation of Authority
  delegations: router({
    list: protectedProcedure.query(async () => {
      return await db.getDelegations();
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDelegationById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        authorityType: z.enum(["financial", "operational", "contractual", "hr", "procurement", "compliance"]),
        delegateeId: z.number().optional(),
        thresholdAmount: z.string().optional(),
        thresholdCurrency: z.string().optional(),
        conditions: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createDelegation({
          ...input,
          delegatorId: ctx.user.id,
          status: "pending",
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "pending", "expired", "revoked"]).optional(),
        thresholdAmount: z.string().optional(),
        conditions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateDelegation(id, data);
      }),
  }),

  // Approval Requests
  approvals: router({
    list: protectedProcedure.query(async () => {
      return await db.getApprovalRequests();
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        requestType: z.enum(["policy_approval", "delegation_approval", "expense_approval", "contract_approval", "compliance_exception"]),
        approverId: z.number().optional(),
        amount: z.string().optional(),
        currency: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createApprovalRequest({
          ...input,
          requesterId: ctx.user.id,
          status: "pending",
        });
      }),
    
    approve: protectedProcedure
      .input(z.object({
        id: z.number(),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { approveRequest } = await import('./approvalWorkflow');
        return await approveRequest({
          requestId: input.id,
          approverId: ctx.user.id,
          comments: input.comments,
        });
      }),
    
    reject: protectedProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { rejectRequest } = await import('./approvalWorkflow');
        return await rejectRequest({
          requestId: input.id,
          approverId: ctx.user.id,
          reason: input.reason,
        });
      }),

    // Get pending approvals for current user
    pending: protectedProcedure.query(async ({ ctx }) => {
      const { getPendingApprovals } = await import('./approvalWorkflow');
      return await getPendingApprovals(ctx.user.id);
    }),

    // Get approval history for current user
    history: protectedProcedure.query(async ({ ctx }) => {
      const { getApprovalHistory } = await import('./approvalWorkflow');
      return await getApprovalHistory(ctx.user.id);
    }),

    // Escalate a request
    escalate: protectedProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { escalateRequest } = await import('./approvalWorkflow');
        return await escalateRequest({
          requestId: input.id,
          userId: ctx.user.id,
          reason: input.reason,
        });
      }),

    // Get approval statistics
    stats: protectedProcedure.query(async () => {
      const { getApprovalStats } = await import('./approvalWorkflow');
      return await getApprovalStats();
    }),
  }),

  // Compliance
  compliance: router({
    list: protectedProcedure.query(async () => {
      return await db.getComplianceRecords();
    }),
    
    create: protectedProcedure
      .input(z.object({
        policyId: z.number().optional(),
        department: z.string(),
        complianceStatus: z.enum(["compliant", "partial", "non_compliant", "pending_review"]).optional(),
        score: z.number().optional(),
        findings: z.string().optional(),
        remediation: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createComplianceRecord({
          ...input,
          assessorId: ctx.user.id,
          lastAssessmentDate: new Date(),
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        complianceStatus: z.enum(["compliant", "partial", "non_compliant", "pending_review"]).optional(),
        score: z.number().optional(),
        findings: z.string().optional(),
        remediation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateComplianceRecord(id, {
          ...data,
          lastAssessmentDate: new Date(),
        });
      }),
  }),

  // Audit Trail - Self-Validating Audit Cache
  audit: router({
    // List audit entries
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAuditTrail(input?.limit || 100);
      }),
    
    // Create new audit entry with hash chain
    log: protectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.number(),
        action: z.enum(["create", "update", "delete", "approve", "reject", "view", "export"]),
        previousValue: z.any().optional(),
        newValue: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createAuditEntry({
          ...input,
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
        });
        return { success: true, ...result };
      }),
    
    // Verify the entire audit chain integrity
    verifyChain: protectedProcedure
      .query(async () => {
        const result = await db.verifyAuditChainIntegrity();
        return result;
      }),
    
    // Get a single entry with verification status
    getVerified: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAuditEntryVerified(input.id);
      }),
    
    // Get audit chain statistics
    statistics: protectedProcedure
      .query(async () => {
        return await db.getAuditStatistics();
      }),
    
    // Export audit trail with verification for compliance
    exportVerified: protectedProcedure
      .mutation(async () => {
        return await db.exportAuditTrailVerified();
      }),
  }),

  // Regulatory Updates
  regulatory: router({
    list: protectedProcedure.query(async () => {
      return await db.getRegulatoryUpdates();
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        summary: z.string().optional(),
        source: z.string().optional(),
        sourceUrl: z.string().optional(),
        regulatoryBody: z.string().optional(),
        jurisdiction: z.string().optional(),
        impactLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createRegulatoryUpdate({
          ...input,
          status: "new",
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "under_review", "action_required", "implemented", "not_applicable"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateRegulatoryUpdate(id, data);
      }),

    // AI-Powered Gap Analysis - Core Innovation
    analyzeImpact: protectedProcedure
      .input(z.object({ updateId: z.number() }))
      .mutation(async ({ input }) => {
        const { analyzeRegulatoryImpact } = await import('./regulatorySync');
        return await analyzeRegulatoryImpact(input.updateId);
      }),

    // Run full gap analysis and create recommendations
    runGapAnalysis: protectedProcedure
      .input(z.object({ updateId: z.number() }))
      .mutation(async ({ input }) => {
        const { runGapAnalysisAndCreateRecommendations } = await import('./regulatorySync');
        return await runGapAnalysisAndCreateRecommendations(input.updateId);
      }),

    // Batch analyze all unanalyzed updates
    batchAnalyze: protectedProcedure
      .mutation(async () => {
        const { batchAnalyzeUpdates } = await import('./regulatorySync');
        return await batchAnalyzeUpdates();
      }),

    // Get policy mappings for a specific policy
    getPolicyMappings: protectedProcedure
      .input(z.object({ policyId: z.number() }))
      .query(async ({ input }) => {
        const { getPolicyMappings } = await import('./regulatorySync');
        return await getPolicyMappings(input.policyId);
      }),

    // Get all gap analysis results from database
    getGapAnalysisResults: protectedProcedure
      .query(async () => {
        const { getGapAnalysisResults } = await import('./regulatorySync');
        return await getGapAnalysisResults();
      }),

    // Fetch live updates from regulatory feeds
    fetchLiveUpdates: protectedProcedure
      .input(z.object({ source: z.enum(['FCA', 'PRA', 'BOE', 'ICO', 'ALL']).optional() }))
      .mutation(async ({ input }) => {
        const { fetchRegulatoryUpdates, fetchAllRegulatoryUpdates } = await import('./regulatoryFeedService');
        if (input.source && input.source !== 'ALL') {
          return await fetchRegulatoryUpdates(input.source);
        }
        return await fetchAllRegulatoryUpdates();
      }),

    // Get feed status for all regulatory bodies
    feedStatus: protectedProcedure
      .query(async () => {
        const { getFeedStatus } = await import('./regulatoryFeedService');
        return await getFeedStatus();
      }),

    // Get update statistics
    statistics: protectedProcedure
      .query(async () => {
        const { getUpdateStatistics } = await import('./regulatoryFeedService');
        return await getUpdateStatistics();
      }),

    // Mark update as reviewed
    markReviewed: protectedProcedure
      .input(z.object({
        updateId: z.number(),
        status: z.enum(['under_review', 'action_required', 'implemented', 'not_applicable']),
      }))
      .mutation(async ({ input, ctx }) => {
        const { markUpdateReviewed } = await import('./regulatoryFeedService');
        return await markUpdateReviewed(input.updateId, ctx.user?.id || 0, input.status);
      }),
  }),

  // AI Recommendations
  recommendations: router({
    list: protectedProcedure.query(async () => {
      return await db.getAIRecommendations();
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.enum(["risk_alert", "compliance_suggestion", "policy_update", "efficiency_improvement", "regulatory_change"]),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        relatedPolicyId: z.number().optional(),
        relatedDepartment: z.string().optional(),
        confidenceScore: z.number().optional(),
        actionItems: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAIRecommendation({
          ...input,
          status: "new",
        });
      }),
    
    acknowledge: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateAIRecommendation(input.id, { status: "acknowledged" });
      }),
    
    implement: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateAIRecommendation(input.id, { status: "implemented" });
      }),
    
    dismiss: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateAIRecommendation(input.id, { status: "dismissed" });
      }),
  }),

  // Report Generation
  reports: router({
    // Generate compliance report
    compliance: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        format: z.enum(['html', 'csv']).optional(),
      }).optional())
      .mutation(async ({ input }) => {
        const { generateComplianceReport } = await import('./reportService');
        return await generateComplianceReport({
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
          format: input?.format,
        });
      }),

    // Generate audit trail report
    audit: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        entityType: z.string().optional(),
        format: z.enum(['html', 'csv']).optional(),
      }).optional())
      .mutation(async ({ input }) => {
        const { generateAuditReport } = await import('./reportService');
        return await generateAuditReport({
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
          entityType: input?.entityType,
          format: input?.format,
        });
      }),

    // Generate policy report
    policies: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        status: z.string().optional(),
        format: z.enum(['html', 'csv']).optional(),
      }).optional())
      .mutation(async ({ input }) => {
        const { generatePolicyReport } = await import('./reportService');
        return await generatePolicyReport(input);
      }),

    // Generate regulatory impact report
    regulatory: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        format: z.enum(['html', 'csv']).optional(),
      }).optional())
      .mutation(async ({ input }) => {
        const { generateRegulatoryReport } = await import('./reportService');
        return await generateRegulatoryReport({
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
          format: input?.format,
        });
      }),

    // Generate executive summary
    executiveSummary: protectedProcedure
      .mutation(async () => {
        const { generateExecutiveSummary } = await import('./reportService');
        return await generateExecutiveSummary();
      }),
  }),

  // Demo Requests (public - no auth required)
  demoRequests: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        phone: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Store demo request in database
        const result = await db.createDemoRequest(input);
        return { success: true, id: result.id };
      }),
  }),



  // Contact Form
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().optional(),
        phone: z.string().optional(),
        inquiryType: z.enum(["demo", "pricing", "partnership", "support", "general", "media"]),
        subject: z.string().min(1),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        // Save to database
        const result = await db.createContactSubmission(input);
        
        // Notify owner about new contact submission
        const inquiryTypeLabels: Record<string, string> = {
          demo: "Demo Request",
          pricing: "Pricing Inquiry",
          partnership: "Partnership Opportunity",
          support: "Technical Support",
          general: "General Inquiry",
          media: "Media & Press",
        };
        
        try {
          await notifyOwner({
            title: `New Contact: ${inquiryTypeLabels[input.inquiryType] || input.inquiryType}`,
            content: `**From:** ${input.name} (${input.email})\n` +
              `**Company:** ${input.company || "Not provided"}\n` +
              `**Subject:** ${input.subject}\n\n` +
              `**Message:**\n${input.message}`,
          });
        } catch (error) {
          // Log but don't fail the submission if notification fails
          console.warn("[Contact] Failed to send owner notification:", error);
        }
        
        return { success: true, id: result.id };
      }),
    
    // Admin endpoints for managing contact submissions
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["new", "read", "replied", "resolved", "archived"]).optional(),
        limit: z.number().min(1).max(100).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getContactSubmissions(input);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getContactSubmissionById(input.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied", "resolved", "archived"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateContactSubmission(id, updates);
      }),
    
    stats: protectedProcedure.query(async () => {
      return await db.getContactSubmissionStats();
    }),
  }),

  // Live Regulatory Feed (fetches from multiple UK regulatory bodies)
  regulatoryFeed: router({
    // Fetch live updates from multiple regulatory RSS feeds
    fetchLive: publicProcedure.query(async () => {
      type RegulatoryItem = {
        id: string;
        title: string;
        source: 'FCA' | 'PRA' | 'ICO' | 'BOE' | 'GOVUK';
        category: string;
        date: string;
        summary: string;
        url: string;
        priority: 'high' | 'medium' | 'low';
      };

      const allItems: RegulatoryItem[] = [];
      const sources: { name: 'FCA' | 'PRA' | 'BOE'; url: string; status: 'success' | 'failed' }[] = [];

      // Helper function to parse RSS XML
      const parseRSS = (xmlText: string, source: 'FCA' | 'PRA' | 'BOE', maxItems = 5): RegulatoryItem[] => {
        const items: RegulatoryItem[] = [];
        const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
        
        itemMatches.slice(0, maxItems).forEach((itemXml, index) => {
          const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
          const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
          const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
          const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
          const categoryMatch = itemXml.match(/<category>([\s\S]*?)<\/category>/);
          
          if (titleMatch && linkMatch) {
            const title = titleMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, '');
            let priority: 'high' | 'medium' | 'low' = 'medium';
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('enforcement') || lowerTitle.includes('warning') ||
                lowerTitle.includes('stops') || lowerTitle.includes('ban') ||
                lowerTitle.includes('fine') || lowerTitle.includes('penalty')) {
              priority = 'high';
            } else if (lowerTitle.includes('consultation') || lowerTitle.includes('guidance') ||
                       lowerTitle.includes('discussion')) {
              priority = 'low';
            }
            
            let dateStr = new Date().toISOString().split('T')[0];
            if (dateMatch) {
              try {
                const parsedDate = new Date(dateMatch[1].trim());
                if (!isNaN(parsedDate.getTime())) {
                  dateStr = parsedDate.toISOString().split('T')[0];
                }
              } catch { /* use default */ }
            }
            
            items.push({
              id: `${source.toLowerCase()}-${index + 1}-${Date.now()}`,
              title,
              source,
              category: categoryMatch ? categoryMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, '') : 'Regulatory Update',
              date: dateStr,
              summary: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim().substring(0, 200) + '...' : '',
              url: linkMatch[1].trim(),
              priority,
            });
          }
        });
        return items;
      };

      // Fetch FCA RSS
      try {
        const fcaResponse = await fetch('https://www.fca.org.uk/news/rss.xml', { signal: AbortSignal.timeout(5000) });
        const fcaXml = await fcaResponse.text();
        const fcaItems = parseRSS(fcaXml, 'FCA', 5);
        allItems.push(...fcaItems);
        sources.push({ name: 'FCA', url: 'https://www.fca.org.uk/news', status: 'success' });
      } catch (e) {
        console.error('[RegulatoryFeed] FCA fetch failed:', e);
        sources.push({ name: 'FCA', url: 'https://www.fca.org.uk/news', status: 'failed' });
      }

      // Fetch Bank of England RSS
      try {
        const boeResponse = await fetch('https://www.bankofengland.co.uk/rss/news', { signal: AbortSignal.timeout(5000) });
        const boeXml = await boeResponse.text();
        const boeItems = parseRSS(boeXml, 'BOE', 4);
        allItems.push(...boeItems);
        sources.push({ name: 'BOE', url: 'https://www.bankofengland.co.uk/news', status: 'success' });
      } catch (e) {
        console.error('[RegulatoryFeed] BOE fetch failed:', e);
        sources.push({ name: 'BOE', url: 'https://www.bankofengland.co.uk/news', status: 'failed' });
      }

      // Fetch PRA RSS (part of Bank of England)
      try {
        const praResponse = await fetch('https://www.bankofengland.co.uk/rss/prudential-regulation-publications', { signal: AbortSignal.timeout(5000) });
        const praXml = await praResponse.text();
        const praItems = parseRSS(praXml, 'PRA', 4);
        allItems.push(...praItems);
        sources.push({ name: 'PRA', url: 'https://www.bankofengland.co.uk/prudential-regulation', status: 'success' });
      } catch (e) {
        console.error('[RegulatoryFeed] PRA fetch failed:', e);
        sources.push({ name: 'PRA', url: 'https://www.bankofengland.co.uk/prudential-regulation', status: 'failed' });
      }

      // Sort by date (newest first)
      allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const successCount = sources.filter(s => s.status === 'success').length;
      
      return {
        success: successCount > 0,
        sources,
        lastFetched: new Date().toISOString(),
        items: allItems,
        summary: {
          total: allItems.length,
          bySource: {
            FCA: allItems.filter(i => i.source === 'FCA').length,
            PRA: allItems.filter(i => i.source === 'PRA').length,
            BOE: allItems.filter(i => i.source === 'BOE').length,
          },
          highPriority: allItems.filter(i => i.priority === 'high').length,
        },
      };
    }),
  }),

  // AI Chat Assistant
  aiChat: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        context: z.object({
          currentPage: z.string().optional(),
          userRole: z.string().optional(),
          pendingTasks: z.number().optional(),
          complianceScore: z.number().optional(),
        }).optional(),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const systemPrompt = `You are RegulaSync Assistant, an AI-powered governance and compliance assistant for RegulaSync platform.

Your role is to help users with:
- Understanding compliance requirements and regulatory updates
- Navigating the platform features (Dashboard, Policies, Compliance, Reports, etc.)
- Providing guidance on policy management and delegation of authority
- Answering questions about UK regulatory bodies (FCA, PRA, BOE, ICO)
- Helping prioritize tasks and compliance activities

Current context:
- User: ${ctx.user.name || 'User'} (${ctx.user.role || 'user'})
- Current page: ${input.context?.currentPage || 'Unknown'}
- Pending tasks: ${input.context?.pendingTasks || 0}
- Compliance score: ${input.context?.complianceScore || 94}%

Be helpful, professional, and concise. If asked about specific data, refer users to the relevant platform sections.
When suggesting actions, be specific about which menu items or buttons to use.
Keep responses under 150 words unless detailed explanation is needed.`;

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
        ];

        // Add conversation history
        if (input.conversationHistory) {
          for (const msg of input.conversationHistory.slice(-10)) {
            messages.push({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            });
          }
        }

        // Add current message
        messages.push({ role: "user", content: input.message });

        try {
          const response = await invokeLLM({ messages });
          const assistantMessage = response.choices[0]?.message?.content;
          
          if (typeof assistantMessage === 'string') {
            return { success: true, response: assistantMessage };
          } else if (Array.isArray(assistantMessage)) {
            const textContent = assistantMessage.find(c => c.type === 'text');
            return { success: true, response: textContent?.text || 'I apologize, but I could not generate a response.' };
          }
          
          return { success: true, response: 'I apologize, but I could not generate a response.' };
        } catch (error) {
          console.error('[AI Chat] LLM error:', error);
          return { 
            success: false, 
            response: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }),
  }),

  // Reminders and Notifications - Real Implementation
  reminders: router({
    // Create a reminder with database persistence
    setReminder: protectedProcedure
      .input(z.object({
        eventTitle: z.string(),
        eventDate: z.string(),
        eventDescription: z.string().optional(),
        reminderType: z.enum(["email", "notification", "both"]).default("both"),
        reminderTime: z.enum(["1_hour", "1_day", "3_days", "1_week"]).default("1_day"),
        relatedEntityType: z.string().optional(),
        relatedEntityId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createReminder } = await import('./notificationService');
        
        // Calculate trigger time based on reminderTime
        const eventDate = new Date(input.eventDate);
        const triggerOffsets = {
          "1_hour": 60 * 60 * 1000,
          "1_day": 24 * 60 * 60 * 1000,
          "3_days": 3 * 24 * 60 * 60 * 1000,
          "1_week": 7 * 24 * 60 * 60 * 1000,
        };
        const triggerAt = new Date(eventDate.getTime() - triggerOffsets[input.reminderTime]);
        
        const reminder = await createReminder({
          userId: ctx.user.id,
          title: input.eventTitle,
          description: input.eventDescription,
          triggerAt,
          reminderType: input.reminderType,
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,
        });

        const reminderTimeText = {
          "1_hour": "1 hour",
          "1_day": "1 day",
          "3_days": "3 days",
          "1_week": "1 week",
        }[input.reminderTime];

        return {
          success: true,
          reminderId: reminder.id,
          message: `Reminder set for ${input.eventTitle}. You will be notified ${reminderTimeText} before the deadline.`,
          reminderDetails: {
            eventTitle: input.eventTitle,
            eventDate: input.eventDate,
            triggerAt: triggerAt.toISOString(),
            reminderTime: input.reminderTime,
            reminderType: input.reminderType,
            setBy: ctx.user.name,
            setAt: new Date().toISOString(),
          },
        };
      }),

    // Cancel a reminder
    cancelReminder: protectedProcedure
      .input(z.object({
        reminderId: z.number().optional(),
        eventTitle: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.reminderId) {
          const { cancelReminder } = await import('./notificationService');
          await cancelReminder(input.reminderId, ctx.user.id);
        }
        
        return {
          success: true,
          message: `Reminder has been cancelled.`,
        };
      }),

    // Get user's reminders
    list: protectedProcedure
      .input(z.object({
        pendingOnly: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        const { getUserReminders } = await import('./notificationService');
        return await getUserReminders(ctx.user.id, input);
      }),

    // Process due reminders (admin only)
    processDue: protectedProcedure
      .mutation(async () => {
        const { processDueReminders } = await import('./notificationService');
        return await processDueReminders();
      }),
  }),

  // User Notifications
  notifications: router({
    // Get user's notifications
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        const { getUserNotifications } = await import('./notificationService');
        return await getUserNotifications(ctx.user.id, input);
      }),

    // Mark notification as read
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { markNotificationRead } = await import('./notificationService');
        return await markNotificationRead(input.notificationId, ctx.user.id);
      }),

    // Mark all notifications as read
    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { markAllNotificationsRead } = await import('./notificationService');
        return await markAllNotificationsRead(ctx.user.id);
      }),

    // Get notification stats
    stats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getNotificationStats } = await import('./notificationService');
        return await getNotificationStats(ctx.user.id);
      }),

    // Create a notification (for internal use)
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(["reminder", "alert", "info", "warning", "success"]).optional(),
        category: z.enum(["deadline", "compliance", "policy", "regulatory", "system"]).optional(),
        actionUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createNotification } = await import('./notificationService');
        return await createNotification({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Departments
  departments: router({
    list: protectedProcedure.query(async () => {
      return await db.getDepartments();
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        code: z.string(),
        description: z.string().optional(),
        headId: z.number().optional(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createDepartment(input);
      }),
  }),

  // Billing and Subscriptions
  billing: router({
    // Get subscription plans
    plans: publicProcedure.query(async () => {
      const { SUBSCRIPTION_PLANS } = await import('./stripe/products');
      return SUBSCRIPTION_PLANS;
    }),

    // Get user's current subscription
    subscription: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSubscription } = await import('./stripe/stripeService');
      return await getUserSubscription(ctx.user.id);
    }),

    // Get payment history
    paymentHistory: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPaymentHistory } = await import('./stripe/stripeService');
      return await getUserPaymentHistory(ctx.user.id);
    }),

    // Create checkout session
    createCheckout: protectedProcedure
      .input(z.object({
        planId: z.string(),
        billingPeriod: z.enum(["monthly", "yearly"]),
        trialDays: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createCheckoutSession } = await import('./stripe/stripeService');
        const origin = ctx.req.headers.origin || ctx.req.headers.referer?.replace(/\/[^/]*$/, '') || 'http://localhost:3000';
        
        return await createCheckoutSession({
          userId: ctx.user.id,
          email: ctx.user.email || '',
          name: ctx.user.name || undefined,
          planId: input.planId,
          billingPeriod: input.billingPeriod,
          origin,
          trialDays: input.trialDays,
        });
      }),

    // Create billing portal session
    createPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { getUserSubscription, createBillingPortalSession } = await import('./stripe/stripeService');
        const { subscription } = await getUserSubscription(ctx.user.id);
        
        if (!subscription?.stripeCustomerId) {
          throw new Error('No active subscription found');
        }
        
        const origin = ctx.req.headers.origin || ctx.req.headers.referer?.replace(/\/[^/]*$/, '') || 'http://localhost:3000';
        const url = await createBillingPortalSession(subscription.stripeCustomerId, `${origin}/billing`);
        return { url };
      }),

    // Cancel subscription
    cancelSubscription: protectedProcedure
      .input(z.object({ immediately: z.boolean().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { getUserSubscription, cancelSubscription } = await import('./stripe/stripeService');
        const { subscription } = await getUserSubscription(ctx.user.id);
        
        if (!subscription?.stripeSubscriptionId) {
          throw new Error('No active subscription found');
        }
        
        await cancelSubscription(subscription.stripeSubscriptionId, input.immediately);
        return { success: true };
      }),

    // Resume subscription
    resumeSubscription: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { getUserSubscription, resumeSubscription } = await import('./stripe/stripeService');
        const { subscription } = await getUserSubscription(ctx.user.id);
        
        if (!subscription?.stripeSubscriptionId) {
          throw new Error('No active subscription found');
        }
        
        await resumeSubscription(subscription.stripeSubscriptionId);
        return { success: true };
      }),
  }),

  // ─── VENDOR RISK MANAGEMENT (TPRM) ───────────────────────────────────────
  vendors: router({
    list: protectedProcedure.query(async () => {
      const { getVendors } = await import('./vendorRiskService');
      return await getVendors();
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getVendorById } = await import('./vendorRiskService');
        return await getVendorById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        website: z.string().optional(),
        contactEmail: z.string().optional(),
        contactName: z.string().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
        riskTier: z.enum(['critical', 'high', 'medium', 'low']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createVendor } = await import('./vendorRiskService');
        return await createVendor({ ...input, createdBy: ctx.user.id });
      }),
    getQuestionnaire: protectedProcedure.query(async () => {
      const { getVendorQuestionnaire } = await import('./vendorRiskService');
      return getVendorQuestionnaire();
    }),
    submitAssessment: protectedProcedure
      .input(z.object({
        vendorId: z.number(),
        responses: z.record(z.string(), z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createVendorAssessment } = await import('./vendorRiskService');
        return await createVendorAssessment({ vendorId: input.vendorId, responses: input.responses as Record<string, string>, assessedBy: ctx.user.id });
      }),
    getAssessments: protectedProcedure
      .input(z.object({ vendorId: z.number() }))
      .query(async ({ input }) => {
        const { getVendorAssessments } = await import('./vendorRiskService');
        return await getVendorAssessments(input.vendorId);
      }),
  }),

  // ─── EVIDENCE COLLECTION ────────────────────────────────────────────────────
  evidence: router({
    list: protectedProcedure
      .input(z.object({
        policyId: z.number().optional(),
        status: z.string().optional(),
        source: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getEvidenceItems } = await import('./evidenceService');
        return await getEvidenceItems(input);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        evidenceType: z.enum(['access_log', 'training_certificate', 'policy_acknowledgment', 'audit_report', 'test_result', 'screenshot', 'document', 'api_response']),
        source: z.enum(['manual', 'microsoft365', 'google_workspace', 'aws', 'api', 'automated']).optional(),
        relatedPolicyId: z.number().optional(),
        relatedControlId: z.string().optional(),
        fileUrl: z.string().optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createEvidenceItem } = await import('./evidenceService');
        return await createEvidenceItem({
          ...input,
          collectedBy: ctx.user.id,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });
      }),
    verify: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { verifyEvidenceItem } = await import('./evidenceService');
        return await verifyEvidenceItem(input.id, ctx.user.id);
      }),
    summary: protectedProcedure.query(async () => {
      const { getEvidenceSummary } = await import('./evidenceService');
      return await getEvidenceSummary();
    }),
    simulateAutoCollection: protectedProcedure.mutation(async ({ ctx }) => {
      const { simulateAutomatedCollection } = await import('./evidenceService');
      return await simulateAutomatedCollection(ctx.user.id);
    }),
  }),

  // ─── ESG TRACKING ───────────────────────────────────────────────────────────
  esg: router({
    list: protectedProcedure
      .input(z.object({ category: z.enum(['environmental', 'social', 'governance']).optional() }).optional())
      .query(async ({ input }) => {
        const { getEsgMetrics } = await import('./esgService');
        return await getEsgMetrics(input?.category);
      }),
    create: protectedProcedure
      .input(z.object({
        reportingPeriod: z.string(),
        category: z.enum(['environmental', 'social', 'governance']),
        metricName: z.string(),
        metricValue: z.string(),
        unit: z.string().optional(),
        target: z.string().optional(),
        status: z.enum(['on_track', 'at_risk', 'off_track', 'achieved']).optional(),
        regulatoryFramework: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createEsgMetric } = await import('./esgService');
        return await createEsgMetric({ ...input, recordedBy: ctx.user.id });
      }),
    summary: protectedProcedure.query(async () => {
      const { getEsgSummary } = await import('./esgService');
      return await getEsgSummary();
    }),
    frameworkMetrics: protectedProcedure.query(async () => {
      const { getEsgFrameworkMetrics } = await import('./esgService');
      return getEsgFrameworkMetrics();
    }),
    seed: protectedProcedure.mutation(async ({ ctx }) => {
      const { seedEsgData } = await import('./esgService');
      return await seedEsgData(ctx.user.id);
    }),
  }),

  // ─── COMPLIANCE PASSPORTS ───────────────────────────────────────────────────
  passports: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getPassports } = await import('./compliancePassportService');
      return await getPassports(ctx.user.id);
    }),
    issue: protectedProcedure
      .input(z.object({ validDays: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { issuePassport } = await import('./compliancePassportService');
        return await issuePassport({ issuedTo: ctx.user.id, validDays: input.validDays });
      }),
    verify: protectedProcedure
      .input(z.object({ passportHash: z.string() }))
      .query(async ({ input }) => {
        const { verifyPassport } = await import('./compliancePassportService');
        return await verifyPassport(input.passportHash);
      }),
  }),

  // ─── INCIDENT SIMULATION ────────────────────────────────────────────────────
  simulations: router({
    list: protectedProcedure.query(async () => {
      const { getSimulations } = await import('./incidentSimulationService');
      return await getSimulations();
    }),
    run: protectedProcedure
      .input(z.object({
        scenarioType: z.enum(['data_breach', 'regulatory_change', 'cyber_attack', 'fraud_incident', 'third_party_failure', 'system_outage', 'staff_misconduct']),
        customDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { runSimulation } = await import('./incidentSimulationService');
        return await runSimulation({ ...input, triggeredBy: ctx.user.id });
      }),
    templates: protectedProcedure.query(async () => {
      const { getScenarioTemplates } = await import('./incidentSimulationService');
      return getScenarioTemplates();
    }),
  }),

  // ─── AGENTIC AI TASKS ───────────────────────────────────────────────────────
  agenticTasks: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const { getAgenticTasks } = await import('./agenticTaskService');
        return await getAgenticTasks(input);
      }),
    create: protectedProcedure
      .input(z.object({
        taskType: z.enum(['policy_draft', 'policy_update', 'gap_remediation', 'evidence_collection', 'report_generation', 'notification_send']),
        title: z.string(),
        description: z.string().optional(),
        triggeredBy: z.enum(['ai_recommendation', 'regulatory_update', 'manual', 'scheduled']),
        sourceId: z.number().optional(),
        sourceType: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createAgenticTask } = await import('./agenticTaskService');
        return await createAgenticTask({ ...input, assignedTo: ctx.user.id });
      }),
    execute: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        const { executeAgenticTask } = await import('./agenticTaskService');
        return await executeAgenticTask(input.taskId);
      }),
    approve: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { approveAgenticTask } = await import('./agenticTaskService');
        return await approveAgenticTask(input.taskId, ctx.user.id);
      }),
    reject: protectedProcedure
      .input(z.object({ taskId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { rejectAgenticTask } = await import('./agenticTaskService');
        return await rejectAgenticTask(input.taskId, ctx.user.id, input.reason);
      }),
    triggerFromUpdate: protectedProcedure
      .input(z.object({ regulatoryUpdateId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { triggerAgenticTasksFromUpdate } = await import('./agenticTaskService');
        return await triggerAgenticTasksFromUpdate(input.regulatoryUpdateId, ctx.user.id);
      }),
  }),

  // ─── PEER BENCHMARKING ──────────────────────────────────────────────────────
  benchmarking: router({
    submit: protectedProcedure
      .input(z.object({
        industry: z.string(),
        orgSize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
      }))
      .mutation(async ({ input, ctx }) => {
        const { submitBenchmarkSnapshot } = await import('./benchmarkService');
        return await submitBenchmarkSnapshot({ ...input, userId: ctx.user.id });
      }),
    compare: protectedProcedure
      .input(z.object({ industry: z.string(), orgSize: z.string() }))
      .query(async ({ input }) => {
        const { getBenchmarkComparison } = await import('./benchmarkService');
        return await getBenchmarkComparison(input.industry, input.orgSize);
      }),
    industries: protectedProcedure.query(async () => {
      const { INDUSTRIES } = await import('./benchmarkService');
      return INDUSTRIES;
    }),
  }),

  // ─── XAI LOGS ───────────────────────────────────────────────────────────────
  xai: router({
    list: protectedProcedure
      .input(z.object({
        recommendationId: z.number().optional(),
        policyId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getXaiLogs } = await import('./xaiService');
        return await getXaiLogs(input);
      }),
    summary: protectedProcedure.query(async () => {
      const { getXaiSummary } = await import('./xaiService');
      return await getXaiSummary();
    }),
    markReviewed: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { markXaiLogReviewed } = await import('./xaiService');
        return await markXaiLogReviewed(input.id, ctx.user.id);
      }),
  }),

  // ─── REGULATOR PORTAL ───────────────────────────────────────────────────────
  regulatorPortal: router({
    listGrants: protectedProcedure.query(async () => {
      const { getPortalAccessGrants } = await import('./regulatorPortalService');
      return await getPortalAccessGrants();
    }),
    grantAccess: protectedProcedure
      .input(z.object({
        regulatorName: z.string(),
        regulatorEmail: z.string().optional(),
        accessScope: z.array(z.string()).optional(),
        validDays: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { grantRegulatorAccess } = await import('./regulatorPortalService');
        return await grantRegulatorAccess({ ...input, grantedBy: ctx.user.id });
      }),
    revokeAccess: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { revokeRegulatorAccess } = await import('./regulatorPortalService');
        return await revokeRegulatorAccess(input.id);
      }),
    getPortalData: protectedProcedure
      .input(z.object({ accessToken: z.string() }))
      .query(async ({ input }) => {
        const { getRegulatorPortalData } = await import('./regulatorPortalService');
        return await getRegulatorPortalData(input.accessToken);
      }),
  }),

  // ─── UNIVERSITY PARTNERSHIPS ────────────────────────────────────────────────
  universities: router({
    list: protectedProcedure.query(async () => {
      const { getPartnerships } = await import('./universityPartnershipService');
      return await getPartnerships();
    }),
    create: protectedProcedure
      .input(z.object({
        institutionName: z.string(),
        contactName: z.string().optional(),
        contactEmail: z.string().optional(),
        country: z.string().optional(),
        programType: z.enum(['student_access', 'research', 'curriculum', 'internship']).optional(),
        studentSeats: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createPartnership } = await import('./universityPartnershipService');
        return await createPartnership(input);
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'active', 'expired', 'suspended']),
      }))
      .mutation(async ({ input }) => {
        const { updatePartnershipStatus } = await import('./universityPartnershipService');
        return await updatePartnershipStatus(input.id, input.status);
      }),
    stats: protectedProcedure.query(async () => {
      const { getPartnershipStats } = await import('./universityPartnershipService');
      return await getPartnershipStats();
    }),
  }),

  // ─── PLATFORM SETTINGS ──────────────────────────────────────────────────────
  settings: router({
    getPublic: publicProcedure.query(async () => {
      const { getPublicSettings, seedDefaultSettings } = await import('./platformSettingsService');
      await seedDefaultSettings();
      return await getPublicSettings();
    }),
    getAll: protectedProcedure.query(async () => {
      const { getAllSettings, seedDefaultSettings } = await import('./platformSettingsService');
      await seedDefaultSettings();
      return await getAllSettings();
    }),
    update: protectedProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { updateSetting } = await import('./platformSettingsService');
        return await updateSetting(input.key, input.value, ctx.user.id);
      }),
  }),

  // Admin utilities
  admin: router({
    // Seed audit trail with sample data (for demo purposes)
    seedAuditData: protectedProcedure
      .mutation(async () => {
        const { seedAuditData } = await import('./seedAuditData');
        return await seedAuditData();
      }),

    // Seed all database tables with comprehensive demo data
    seedAllData: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { seedAllData } = await import('./seedDatabase');
        return await seedAllData(ctx.user.id, ctx.user.name || 'Admin');
      }),

    // Run gap analysis on all regulatory updates
    runGapAnalysis: protectedProcedure
      .mutation(async () => {
        const { batchAnalyzeUpdates } = await import('./regulatorySync');
        return await batchAnalyzeUpdates();
      }),

    // Process due reminders (should be called by cron job)
    processDueReminders: protectedProcedure
      .mutation(async () => {
        const { processDueReminders } = await import('./notificationService');
        return await processDueReminders();
      }),

    // Rebuild audit chain from scratch (fixes broken chain)
    rebuildAuditChain: protectedProcedure
      .mutation(async () => {
        const { rebuildAuditChain } = await import('./rebuildAuditChain');
        return await rebuildAuditChain();
      }),

    // Seed gap analysis with realistic UK regulatory scenarios
    seedGapAnalysis: protectedProcedure
      .mutation(async () => {
        const { seedGapAnalysisData } = await import('./seedGapAnalysis');
        return await seedGapAnalysisData();
      }),
  }),
});

export type AppRouter = typeof appRouter;
