import { NextResponse } from "next/server";
import { loadRepoConfig } from "../../../lib/config";
import { fetchOpenPRs } from "../../../lib/github";
import { PullRow } from "../../../lib/types";
import { RepoRef } from "../../../lib/config";

export const dynamic = "force-dynamic"; // no caching
export const revalidate = 0;

export const GET = async () => {
  const repos = loadRepoConfig();

  const results = await Promise.allSettled(
    repos.map(({ org, repo, minReviews, maxReviewTimeHours } : RepoRef) =>
      fetchOpenPRs(org, repo, 50).then((prs) =>
        prs.map((pr) => ({ 
          ...pr, 
          minReviews,
          slaBreached: pr.ageSeconds > maxReviewTimeHours * 3600
        }))
      )
    )
  );

  const rows: PullRow[] = [];
  const errors: string[] = [];

  for (const res of results) {
    if (res.status === "fulfilled") {
      rows.push(...res.value)
    } else {
      errors.push(String(res.reason?.message ?? res.reason ?? "unknown error"));
    }
  }

  // Oldest first
  rows.sort((a, b) => b.ageSeconds - a.ageSeconds);

  return NextResponse
    .json({
      generatedAt: new Date().toISOString(),
      rows,
      errors
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });
}
