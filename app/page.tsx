import { Portfolio } from "@/components/portfolio";
import { GitHubActivity } from "@/components/github-activity";
import { content } from "@/content";
import { getGitHubData } from "@/lib/github";
import { jsonLd, profilePageSchema } from "@/lib/seo";

export default async function Home() {
  const github = await getGitHubData(content.person.github, content.hiddenRepos);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(profilePageSchema)} />
      <Portfolio github={<GitHubActivity data={github} />} />
    </>
  );
}
