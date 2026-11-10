import { Portfolio } from "@/components/portfolio";
import { GitHubActivity } from "@/components/github-activity";
import { content } from "@/content";
import { getGitHubData } from "@/lib/github";

export default async function Home() {
  const github = await getGitHubData(content.person.github, content.hiddenRepos);
  return <Portfolio github={<GitHubActivity data={github} />} />;
}
