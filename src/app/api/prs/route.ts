import { NextResponse } from "next/server";
import { loadRepoConfig } from "../../../lib/config";
import { fetchOpenPRs } from "../../../lib/github";
import { PullRow } from "../../../lib/types";
import { RepoRef, defaultTTL } from "../../../lib/config";

export const dynamic = "force-dynamic"; // no caching
export const revalidate = 0;

let cache: { expiresAt: number; payload: any } | null = null;
let inFlightRequest: Promise<any> | null = null;

const buildPayload = async () => {
  const repos = loadRepoConfig();

  const results = await Promise.allSettled(
    repos.map(({ org, repo, minApprovals, maxReviewTimeHours } : RepoRef) =>
      fetchOpenPRs(org, repo, 50).then((prs) => // TODO: Push in entire org object and calc approvals/slas etc there
        prs.map((pr) => ({ 
          ...pr, 
          minApprovals,
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

  return {
    generatedAt: new Date().toISOString(),
    cachedAt: new Date().toISOString(),
    ttlSeconds: Math.floor(defaultTTL / 1000),
    rows,
    errors
  }
}

export const GET = async () => {
  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    // Cache Hit
    return NextResponse.json(cache.payload, {
      headers: {
        "Cache-Control": "no-store",
        "Expires": new Date(cache.expiresAt).toISOString(),
        "x-gh-watch-cache": "HIT",
      }
    });
  }

  // Cache Miss - Build new payload if not already doing so
  if (!inFlightRequest) {
    inFlightRequest = (async () => {
      const payload = await buildPayload();
      cache = { 
        payload, 
        expiresAt: Date.now() + defaultTTL
      };
      return payload;
    })().finally(() => {
      inFlightRequest = null;
    });
  }

  const payload = await inFlightRequest;

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
      "Expires": new Date(cache.expiresAt).toISOString(),
      "x-gh-watch-cache": "MISS",
    }
  });
}
