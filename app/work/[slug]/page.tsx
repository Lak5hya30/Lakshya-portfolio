import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content, type ProjectItem } from "@/content";
import { jsonLd, projectSchema } from "@/lib/seo";
import { Cover } from "@/components/project-cover";
import { SiteFooter } from "@/components/site-footer";
import { TrackView } from "@/components/analytics";
import { ArrowUpRight, GitHubIcon } from "@/components/icons";
import { SubpageHeader } from "@/components/subpage-header";

const projects = content.projects as readonly ProjectItem[];
const find = (slug: string) => projects.find((project) => project.slug === slug);

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = find((await params).slug);
  if (!project) return {};
  const path = `/work/${project.slug}`;
  return {
    title: `${project.title} — Case study`,
    description: project.description,
    alternates: { canonical: path },
    openGraph: { title: `${project.title} — Lakshya Gupta`, description: project.description, type: "article", url: path },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = find((await params).slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  // Only sections backed by verified facts are rendered; nothing is padded with placeholders.
  const story = ([
    ["The problem", project.problem],
    ["Architecture", project.architecture],
  ] as const).filter(([, value]) => value);

  return (
    <div className="site-shell case-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(projectSchema(project))} />
      <TrackView event="case_study_view" detail={project.slug} />
      <a className="skip-link" href="#case-main">Skip to content</a>
      <SubpageHeader back={{ href: "/work", label: "All work" }} />

      <main id="case-main" className="case-main">
        <p className="section-kicker">{project.category} · Case study</p>
        <h1 className="case-title">{project.title}</h1>
        <p className="case-lede">{project.description}</p>
        <dl className="case-facts">
          {project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}
          {project.timeframe && <div><dt>Timeframe</dt><dd>{project.timeframe}</dd></div>}
          <div><dt>Stack</dt><dd>{project.stack.join(" · ")}</dd></div>
        </dl>
        <div className="case-actions">
          {project.href && <a className="button button-primary" href={project.href} target="_blank" rel="noreferrer" data-track="github_click"><GitHubIcon /> View source</a>}
          {project.demo && <a className="button" href={project.demo} target="_blank" rel="noreferrer" data-track="demo_click">Open live demo <ArrowUpRight /></a>}
        </div>

        <figure className="case-cover">
          <Cover slug={project.slug} />
          <figcaption>Illustration of the project&apos;s core idea.</figcaption>
        </figure>

        <div className="case-body">
          {story.map(([title, value]) => (
            <section key={title} className="case-section">
              <h2>{title}</h2>
              <p>{value}</p>
              {title === "Architecture" && project.components && (
                <ol className="system-map" aria-label={`${project.title} components`}>
                  {project.components.map((part, step) => (
                    <li key={part.name}>
                      <span className="system-step" aria-hidden="true">{String(step + 1).padStart(2, "0")}</span>
                      <strong>{part.name}</strong>
                      <span className="system-detail">{part.detail}</span>
                      <code>{part.where}</code>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
          {project.decisions && (
            <section className="case-section">
              <h2>Key decisions &amp; trade-offs</h2>
              <ul className="case-list">{project.decisions.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
          <section className="case-section">
            <h2>Implementation</h2>
            <ul className="case-list">{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          {project.challenges && <section className="case-section"><h2>Challenges</h2><p>{project.challenges}</p></section>}
          {project.testing && <section className="case-section"><h2>Testing &amp; validation</h2><p>{project.testing}</p></section>}
          {project.outcome && <section className="case-section"><h2>Verified results</h2><p>{project.outcome}</p></section>}
          {project.limitations && (
            <section className="case-section">
              <h2>Limitations</h2>
              <ul className="case-list">{project.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
          <section className="case-section">
            <h2>Capabilities</h2>
            <ul className="tags">{project.capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>

        <nav className="case-pager" aria-label="More projects">
          <Link href={`/work/${previous.slug}`}><span>Previous</span>{previous.title}</Link>
          <Link href={`/work/${next.slug}`}><span>Next</span>{next.title}</Link>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
