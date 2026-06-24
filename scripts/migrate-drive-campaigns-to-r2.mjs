/**
 * One-off: download public Google Drive campaign videos and upload to Cloudflare R2.
 *
 * Run from repo root (loads .env.local if present):
 *   node scripts/migrate-drive-campaigns-to-r2.mjs
 *
 * Optional: --dry-run (list only), --id=may-img-2330-a (single campaign)
 *
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME,
 *           NEXT_PUBLIC_R2_PUBLIC_URL
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim();
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME?.trim() || "beyondvision";
const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");

const dryRun = process.argv.includes("--dry-run");
const singleId = process.argv.find((a) => a.startsWith("--id="))?.split("=")[1];

function parseCampaignsFromDriveContent() {
  const tsPath = path.join(root, "src", "lib", "drive-content.ts");
  const source = fs.readFileSync(tsPath, "utf8");
  const block = source.match(/export const driveCampaignContent[\s\S]*?^\];/m);
  if (!block) throw new Error("Could not find driveCampaignContent in drive-content.ts");

  const campaigns = [];
  const entryRe = /\{\s*id:\s*"([^"]+)"[\s\S]*?driveFileId:\s*"([^"]+)"/g;
  let m;
  while ((m = entryRe.exec(block[0])) !== null) {
    campaigns.push({ id: m[1], driveFileId: m[2] });
  }
  return campaigns;
}

async function downloadFromDrive(fileId) {
  const attempts = [
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
  ];

  async function fetchOnce(url) {
    const res = await fetch(url, { redirect: "follow" });
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "";
    return { buf, ct };
  }

  for (const url of attempts) {
    let { buf, ct } = await fetchOnce(url);
    if (!ct.includes("text/html") && buf.length > 64 * 1024) {
      return buf;
    }

    const html = buf.toString("utf8");
    const confirm =
      html.match(/confirm=([0-9A-Za-z_]+)/)?.[1] ||
      html.match(/name="confirm"\s+value="([^"]+)"/)?.[1];

    if (confirm) {
      const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirm}`;
      ({ buf, ct } = await fetchOnce(confirmUrl));
      if (!ct.includes("text/html") && buf.length > 64 * 1024) {
        return buf;
      }
    }
  }

  throw new Error("Drive returned HTML instead of video (check sharing / file size)");
}

async function main() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("Missing R2 credentials in .env.local (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).");
    process.exit(1);
  }
  if (!R2_PUBLIC) {
    console.error("Missing NEXT_PUBLIC_R2_PUBLIC_URL in .env.local.");
    process.exit(1);
  }

  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  let campaigns = parseCampaignsFromDriveContent();
  if (singleId) campaigns = campaigns.filter((c) => c.id === singleId);

  if (!campaigns.length) {
    console.error("No campaigns to migrate.");
    process.exit(1);
  }

  console.log(`Migrating ${campaigns.length} campaign(s) to R2 bucket "${R2_BUCKET_NAME}"…\n`);

  const results = [];

  for (const { id, driveFileId } of campaigns) {
    const key = `campaigns/${id}.mp4`;
    const videoUrl = `${R2_PUBLIC}/${key}`;

    if (dryRun) {
      console.log(`[dry-run] ${id} → ${videoUrl} (drive: ${driveFileId})`);
      results.push({ id, videoUrl, status: "dry-run" });
      continue;
    }

    try {
      try {
        await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
        console.log(`[skip] ${id} — already on R2`);
        results.push({ id, videoUrl, status: "skipped" });
        continue;
      } catch {
        /* not found — upload */
      }

      process.stdout.write(`[download] ${id}… `);
      const body = await downloadFromDrive(driveFileId);
      process.stdout.write(`${(body.length / 1024 / 1024).toFixed(2)} MB → `);

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: "video/mp4",
        })
      );

      console.log("uploaded");
      results.push({ id, videoUrl, status: "ok", bytes: body.length });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      results.push({ id, videoUrl, status: "error", error: err.message });
    }
  }

  console.log("\n--- Summary ---");
  console.table(results.map(({ id, videoUrl, status, error }) => ({ id, videoUrl, status, error: error || "" })));

  const failed = results.filter((r) => r.status === "error").length;
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
