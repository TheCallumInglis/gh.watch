export type PullRow = Author & {
  repo: string;
  number: number;
  title: string;
  url: string;
  updatedAt: string;
  ageSeconds: number;
  reviewerCount: number;
  approvalCount: number;
  minApprovals: number;
  isDraft: boolean;
  slaBreached?: boolean;
};

export type Author = {
  author: string;
  authorAvatarUrl?: string;
}