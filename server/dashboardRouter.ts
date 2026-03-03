/**
 * Dashboard Router — Market Pulse
 * Handles data.json persistence: read, update watchlist, update publications.
 * Single source of truth: data.json stored in S3 and synced to GitHub.
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut, storageGet } from "./storage";
import { ENV } from "./_core/env";

const DATA_KEY = "market-pulse/data.json";
const GITHUB_REPO = "Apgomes3/market-pulse";
const GITHUB_FILE_PATH = "client/public/data.json";

// ─── GitHub sync helper ───────────────────────────────────────────────────────
async function syncToGitHub(jsonContent: string): Promise<void> {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("[GitHub] No token available — skipping GitHub sync");
    return;
  }

  try {
    // Get current file SHA
    const shaRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    let sha: string | undefined;
    if (shaRes.ok) {
      const shaData = await shaRes.json();
      sha = shaData.sha;
    }

    // Push updated file
    const body: Record<string, string> = {
      message: `chore: update data.json watchlist/publications [automated]`,
      content: Buffer.from(jsonContent).toString("base64"),
    };
    if (sha) body.sha = sha;

    const updateRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (updateRes.ok) {
      console.log("[GitHub] data.json synced successfully");
    } else {
      const err = await updateRes.text();
      console.error("[GitHub] Sync failed:", updateRes.status, err);
    }
  } catch (err) {
    console.error("[GitHub] Sync error:", err);
  }
}

// ─── S3 helpers ───────────────────────────────────────────────────────────────
async function readDataFromS3(): Promise<Record<string, unknown> | null> {
  try {
    const { url } = await storageGet(DATA_KEY);
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function writeDataToS3(data: Record<string, unknown>): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await storagePut(DATA_KEY, Buffer.from(json), "application/json");
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const dashboardRouter = router({
  /**
   * Get dashboard data — tries S3 first, falls back to static file
   */
  getData: publicProcedure.query(async () => {
    const s3Data = await readDataFromS3();
    return { data: s3Data, source: s3Data ? "s3" : "static" };
  }),

  /**
   * Update watchlist — persists to S3 and syncs to GitHub
   */
  updateWatchlist: publicProcedure
    .input(z.object({ watchlist: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      // Read current data
      const current = await readDataFromS3();
      if (!current) {
        throw new Error("No data found in S3. Upload data.json first.");
      }

      // Merge updated watchlist
      const updated = { ...current, watchlist: input.watchlist };

      // Write back to S3
      await writeDataToS3(updated);

      // Sync to GitHub (non-blocking)
      const jsonContent = JSON.stringify(updated, null, 2);
      syncToGitHub(jsonContent).catch(console.error);

      return { success: true, watchlist: input.watchlist };
    }),

  /**
   * Update publications — persists to S3 and syncs to GitHub
   */
  updatePublications: publicProcedure
    .input(
      z.object({
        publications: z.array(
          z.object({ name: z.string(), url: z.string() })
        ),
      })
    )
    .mutation(async ({ input }) => {
      // Read current data
      const current = await readDataFromS3();
      if (!current) {
        throw new Error("No data found in S3. Upload data.json first.");
      }

      // Merge updated publications
      const updated = { ...current, substackPublications: input.publications };

      // Write back to S3
      await writeDataToS3(updated);

      // Sync to GitHub (non-blocking)
      const jsonContent = JSON.stringify(updated, null, 2);
      syncToGitHub(jsonContent).catch(console.error);

      return { success: true, publications: input.publications };
    }),

  /**
   * Upload full data.json — called by the daily automation script
   * Accepts the full JSON payload and stores it in S3 + syncs to GitHub
   */
  uploadDailyData: publicProcedure
    .input(z.object({ data: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      await writeDataToS3(input.data as Record<string, unknown>);

      const jsonContent = JSON.stringify(input.data, null, 2);
      syncToGitHub(jsonContent).catch(console.error);

      return { success: true };
    }),
});
