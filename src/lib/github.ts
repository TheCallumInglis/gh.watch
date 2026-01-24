import { Octokit } from "@octokit/rest";
import { PullRow } from "./types";
import { requireEnv } from "../utils/requireEnv";

const octokit = (): Octokit => {
  return new Octokit({ auth: requireEnv("GITHUB_TOKEN") });
}

type ReviewsNode = {
  author?: { login: string } | null;
  submittedAt?: string | null;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
};

type PRNode = {
  number: number;
  title: string;
  url: string;
  updatedAt: string;
  author?: { 
    login: string; 
    avatarUrl: string
  } | null;
  reviews: { 
    nodes: ReviewsNode[] 
  };
  isDraft?: boolean;
};

export const fetchOpenPRs = async (
  org: string,
  repo: string,
  limit = 50
): Promise<PullRow[]> => {
  const api = octokit();

  const query = `
    query($owner: String!, $repo: String!, $limit: Int!) {
      rateLimit { limit remaining resetAt cost }
      repository(owner: $owner, name: $repo) {
        pullRequests(first: $limit, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            number
            title
            url
            updatedAt
            author { 
              login
              avatarUrl
            }
            isDraft
            reviews(first: 100) {
              nodes {
                state
                submittedAt
                author { 
                  login
                }
              }
            }
          }
        }
      }
    }
  `;

  const res: any = await api.graphql(query, {
    owner: org,
    repo,
    limit: Math.min(limit, 100),
  });

  const prs: PRNode[] = res?.repository?.pullRequests?.nodes ?? [];
  const now = Date.now();

  return prs.map((pr) => {
    const updatedAt = pr.updatedAt ?? new Date().toISOString();
    const ageSeconds = Math.max(0, Math.floor((now - new Date(updatedAt).getTime()) / 1000));

    // Only consider non-pending reviews made after the last update, per user
    const latestReviewsByUser = new Map<string, { state: string; submittedAt: number }>();

    for (const r of pr.reviews?.nodes ?? [] as ReviewsNode[]) {
      const login = r.author?.login ?? null;
      if (!login) continue;
      if (r.state === "PENDING") continue;

      const submittedAt = r.submittedAt ? new Date(r.submittedAt).getTime() : 0;

      const existingReview = latestReviewsByUser.get(login);
      if (!existingReview || submittedAt >= new Date(updatedAt).getTime()) {
        // No existing review, or this one is newer
        latestReviewsByUser.set(login, { state: r.state, submittedAt });
      }
    }

    const reviewerCount = latestReviewsByUser.size;
    const approvalCount = Array.from(latestReviewsByUser.values())
        .filter((x) => x.state === "APPROVED")
        .length;

    return {
      repo: `${org}/${repo}`,
      number: pr.number,
      title: pr.title ?? "",
      author: pr.author?.login ?? "unknown",
      authorAvatarUrl: pr.author?.avatarUrl,
      url: pr.url ?? "",
      updatedAt,
      ageSeconds,
      reviewerCount,
      approvalCount,
      minApprovals: 0, // Populated Later
      isDraft: pr.isDraft ?? false,
    };
  });
};
