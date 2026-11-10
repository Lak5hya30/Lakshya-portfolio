import type { GitHubData } from "@/lib/github";
import { ArrowUpRight, GitHubIcon } from "./icons";

const dayFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

/** Server-rendered summary of public GitHub activity. Renders a calm fallback when the API is unavailable. */
export function GitHubActivity({ data }: { data: GitHubData }) {
  if (!data.ok) {
    return (
      <aside className="github-activity is-unavailable" aria-label="GitHub activity">
        <p>Live GitHub activity is unavailable right now.</p>
        <a className="text-link" href={data.profileUrl} target="_blank" rel="noreferrer"><GitHubIcon /> See my profile on GitHub <ArrowUpRight /></a>
      </aside>
    );
  }

  const languages = [...new Set(data.repos.map((repo) => repo.language).filter(Boolean))].slice(0, 5);
  const lastPush = data.repos[0]?.pushedAt;

  return (
    <aside className={`github-activity${data.activity.length ? "" : " is-stats-only"}`} aria-labelledby="github-title">
      <div className="github-head">
        <h3 id="github-title"><GitHubIcon /> On GitHub</h3>
        <a className="text-link" href={data.profileUrl} target="_blank" rel="noreferrer">Profile <ArrowUpRight /></a>
      </div>
      <dl className="github-stats">
        <div><dt>Public repositories</dt><dd>{data.publicRepos}</dd></div>
        {lastPush && <div><dt>Last push</dt><dd>{dayFormat.format(new Date(lastPush))}</dd></div>}
        {languages.length > 0 && <div><dt>Languages</dt><dd>{languages.join(" · ")}</dd></div>}
      </dl>
      {data.activity.length > 0 && (
        <ol className="github-feed">
          {data.activity.map((item) => (
            <li key={`${item.type}-${item.repo}-${item.at}`}>
              <time dateTime={item.at}>{dayFormat.format(new Date(item.at))}</time>
              <span>{item.summary} in <a href={item.url} target="_blank" rel="noreferrer">{item.repo}</a></span>
            </li>
          ))}
        </ol>
      )}
      <p className="github-note">Updated hourly from the GitHub API.</p>
    </aside>
  );
}
