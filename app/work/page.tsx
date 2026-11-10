import type { Metadata } from "next";
import Link from "next/link";
import { content, type ProjectItem } from "@/content";
import { Cover } from "@/components/project-cover";
import { SiteFooter } from "@/components/site-footer";
import { SubpageHeader } from "@/components/subpage-header";
import { ArrowUpRight, GitHubIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Case studies of Lakshya Gupta's engineering projects: a closed-loop payment-fraud defense lab, a Pygame tile-based shooter and a voice-controlled assistant.",
  alternates: { canonical: "/work" },
};

const projects = content.projects as readonly ProjectItem[];

export default function WorkIndex() {
  return (
    <div className="site-shell case-page">
      <a className="skip-link" href="#work-main">Skip to content</a>
      <SubpageHeader back={{ href: "/", label: "Home" }} />
      <main id="work-main" className="case-main">
        <p className="section-kicker">Selected work</p>
        <h1 className="case-title">Built to be useful, not ornamental.</h1>
        <p className="case-lede">
          Three projects, each with a case study: the problem, how it is built, the decisions behind it and what was verified.
        </p>
        <ol className="work-index">
          {projects.map((project, index) => (
            <li key={project.slug}>
              <Link className="work-index-cover" href={`/work/${project.slug}`} aria-hidden="true" tabIndex={-1}>
                <Cover slug={project.slug} />
              </Link>
              <div className="work-index-body">
                <p className="project-meta">
                  <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.category}</span>
                </p>
                <h2><Link href={`/work/${project.slug}`}>{project.title}</Link></h2>
                <p>{project.description}</p>
                <ul className="tags" aria-label="Built with">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
                <div className="project-links">
                  <Link className="text-link" href={`/work/${project.slug}`} data-track="case_study_open">
                    Read case study<span className="sr-only">: {project.title}</span> <ArrowUpRight />
                  </Link>
                  {project.href && (
                    <a className="text-link" href={project.href} target="_blank" rel="noreferrer" data-track="github_click">
                      <GitHubIcon /> View source<span className="sr-only"> of {project.title}</span>
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
