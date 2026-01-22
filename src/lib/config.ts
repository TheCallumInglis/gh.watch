import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

// TODO: Override by env
const reposFilePath = path.join(process.cwd(), "assets", "repos.yaml");
const defaultMinReviews = 0;
const defaultMaxReviewTimeHours = 72;

export type RepoRef = {
  org: string;
  repo: string;
  minReviews: number;
  maxReviewTimeHours: number;
};

type RawConfig = {
  orgs: {
    name: string;
    minReviews?: number;
    maxReviewTimeHours?: number;
    repos: string[];
  }[];
};

export const loadRepoConfig = (): RepoRef[] => {
  const raw = fs.readFileSync(reposFilePath, "utf8");
  const parsed = yaml.load(raw) as RawConfig;

  const result: RepoRef[] = [];

  // $.orgs
  if (!parsed?.orgs || !Array.isArray(parsed.orgs)) {
    throw new Error(`${reposFilePath} must contain an 'orgs' array`);
  }

  // $.orgs[].name, $.orgs[].repos[]
  for (const org of parsed.orgs) {
    if (!org.name || !Array.isArray(org.repos)) {
      throw new Error(`Invalid org entry in ${reposFilePath}: ${JSON.stringify(org)}`);
    }

    const minReviews =
      typeof org.minReviews === "number" && Number.isFinite(org.minReviews)
        ? org.minReviews
        : defaultMinReviews;
    
    const maxReviewTimeHours =
      typeof org.maxReviewTimeHours === "number" && Number.isFinite(org.maxReviewTimeHours)
        ? org.maxReviewTimeHours
        : defaultMaxReviewTimeHours;

    for (const repo of org.repos) {
      if (!repo) continue;

      result.push({
        org: org.name.trim(),
        repo: repo.trim(),
        minReviews,
        maxReviewTimeHours
      });
    }
  }

  if (result.length === 0) {
    throw new Error(`No repositories found in ${reposFilePath}`);
  }

  return result;
}
