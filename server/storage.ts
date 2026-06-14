/**
 * File storage helper — stores uploads on local disk under /uploads.
 * For production, replace with S3/Cloudflare R2/Backblaze B2 as needed.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Store a file and return its public URL path.
 * @param relKey  Relative key, e.g. "user-123/avatar.png"
 * @param data    File content as Buffer, Uint8Array, or string
 * @param _contentType  MIME type (unused locally, kept for API compatibility)
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType?: string
): Promise<{ key: string; url: string }> {
  ensureUploadDir();
  const safeName = crypto.createHash("sha256").update(relKey).digest("hex").slice(0, 16) +
    "_" + path.basename(relKey).replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(UPLOAD_DIR, safeName);
  fs.writeFileSync(filePath, data instanceof Uint8Array ? Buffer.from(data) : data);
  const url = `/uploads/${safeName}`;
  return { key: safeName, url };
}

/**
 * Get the URL for a stored file.
 */
export async function storageGet(key: string): Promise<{ key: string; url: string }> {
  return { key, url: `/uploads/${key}` };
}
