export type PullRow = {
  repo: string;
  number: number;
  title: string;
  author: string;
  authorAvatarUrl?: string;
  url: string;
  updatedAt: string;
  ageSeconds: number;
  reviewerCount: number;
  approvalCount: number;
  minReviews: number;
  isDraft: boolean;
};
