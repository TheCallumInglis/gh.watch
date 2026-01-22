import { NextResponse } from "next/server";
import { loadRepoConfig } from "../../../lib/config";
import { fetchOpenPRs } from "../../../lib/github";
import { PullRow } from "../../../lib/types";
import { RepoRef } from "../../../lib/config";

export const dynamic = "force-dynamic"; // no caching

export const GET = async () => {
  const repos = loadRepoConfig();

  const results = await Promise.allSettled(
    repos.map(({ org, repo, minReviews } : RepoRef) =>
      fetchOpenPRs(org, repo, 50).then((prs) =>
        prs.map((pr) => ({ 
          ...pr, 
          minReviews,
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

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    rows,
    errors
  });
}
