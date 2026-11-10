import { cacheLife } from "next/cache";

export type Repo = {
  name: string;
  url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export type ActivityItem = { repo: string; url: string; type: string; summary: string; at: string };

export type GitHubData =
  | { ok: true; profileUrl: string; publicRepos: number; repos: Repo[]; activity: ActivityItem[]; fetchedAt: string }
  | { ok: false; profileUrl: string; reason: string };

type RawRepo = {
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

type RawEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: { commits?: unknown[]; size?: number; action?: string; ref_type?: string };
};

function describe(event: RawEvent): string | null {
  switch (event.type) {
    case "PushEvent": {
      const count = event.payload.size ?? event.payload.commits?.length ?? 1;
      return `Pushed ${count} commit${count === 1 ? "" : "s"}`;
    }
    case "CreateEvent":
      return event.payload.ref_type === "repository" ? "Created repository" : `Created ${event.payload.ref_type ?? "branch"}`;
    case "PullRequestEvent":
      return `${event.payload.action === "closed" ? "Closed" : "Opened"} a pull request`;
    case "IssuesEvent":
      return `${event.payload.action === "closed" ? "Closed" : "Opened"} an issue`;
    case "ForkEvent":
      return "Forked repository";
    case "ReleaseEvent":
      return "Published a release";
    default:
      return null;
  }
}

async function request<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-site" };
  // Optional server-side token raises the rate limit from 60 to 5,000 requests per hour. Never sent to the browser.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(8000) });
  if (response.status === 403 || response.status === 429) throw new Error("GitHub rate limit reached");
  if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
  return response.json() as Promise<T>;
}

/** Public repos and recent activity, cached for an hour so visitors never hit GitHub's rate limit. */
export async function getGitHubData(username: string, hidden: readonly string[]): Promise<GitHubData> {
  "use cache";
  cacheLife("hours");
  const profileUrl = `https://github.com/${username}`;
  try {
    const [user, rawRepos, rawEvents] = await Promise.all([
      request<{ public_repos: number }>(`/users/${username}`),
      request<RawRepo[]>(`/users/${username}/repos?sort=pushed&per_page=30`),
      request<RawEvent[]>(`/users/${username}/events/public?per_page=40`).catch(() => [] as RawEvent[]),
    ]);
    const repos = rawRepos
      .filter((repo) => !repo.fork && !repo.archived && !hidden.includes(repo.name))
      .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        homepage: repo.homepage || null,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        pushedAt: repo.pushed_at,
      }));
    const activity = rawEvents
      .map((event) => {
        const summary = describe(event);
        return summary
          ? { repo: event.repo.name.split("/").pop() ?? event.repo.name, url: `https://github.com/${event.repo.name}`, type: event.type, summary, at: event.created_at }
          : null;
      })
      .filter((item): item is ActivityItem => item !== null)
      .slice(0, 6);
    return { ok: true, profileUrl, publicRepos: user.public_repos, repos, activity, fetchedAt: new Date().toISOString() };
  } catch (error) {
    return { ok: false, profileUrl, reason: error instanceof Error ? error.message : "GitHub is unavailable" };
  }
}
