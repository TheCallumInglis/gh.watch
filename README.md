# gh.watch

Lightweight GitHub repository watcher built with Next.js / TypeScript. Designed for quick overview of active PRs across multiple organisations & repositories.

![GH Watch - v1.1.2](./assets/gh-watch.1.1.2.png)

## Features
* View Open Pull Requests across multiple GitHub Organisations / Repositories
* Highlights PRs breaching SLA based on time since last update
* Configurable minimum approvals and maximum review time per Organisation
* Auto-refreshing data every 30 seconds with caching to reduce GitHub API calls
* Filter by Organisation and Author

## Ideas List
* [ ] PR Status Checks
* [ ] Read `assets/repos.yaml` from specified GitHub Repo
* [ ] Dark Mode
* [ ] Webhook integration for Teams

## Setup

### Environment Variables
- `GITHUB_TOKEN` (Required): GitHub Personal Access Token with `repo` and `read:org` scopes.

### Repo Configuration
The `assets/repos.yaml` file should be structured as per the example given.

Notes:
- There is no distinction between an Individual or Organisation account. Both are defined under `orgs`.
- `minApprovals` and `maxReviewTimeHours` are optional and can be set per org.
- Your PAT must have access to all specified repositories.

```yaml
orgs:
- name: 4OH4-Ltd
  minApprovals: 1
  maxReviewTimeHours: 48
  repos:
    - bike.diary.customer
    - bike.diary.api
    - bike.diary.legacy

- name: TheCallumInglis
  minApprovals: 0
  maxReviewTimeHours: 72
  repos:
    - gh.watch
    - proxmox.k8s
    - project-timer-cube
```

Run with Node:
```bash
npm run dev
```

Run with Docker:
```bash
docker-compose up --build
```
