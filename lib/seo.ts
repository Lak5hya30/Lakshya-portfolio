import { content, type ProjectItem } from "@/content";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const person = {
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: content.person.name,
  jobTitle: content.person.role,
  description: content.person.summary,
  email: `mailto:${content.person.email}`,
  url: siteUrl,
  alumniOf: { "@type": "CollegeOrUniversity", name: content.education.school },
  knowsAbout: content.skills.flatMap((group) => group.values),
  sameAs: content.links.map((link) => link.href),
};

export const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: siteUrl,
  name: "Lakshya Gupta — Software Developer",
  mainEntity: person,
};

export function projectSchema(project: ProjectItem) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    url: `${siteUrl}/work/${project.slug}`,
    codeRepository: project.href,
    programmingLanguage: project.stack[0],
    keywords: project.stack.join(", "),
    author: { "@id": `${siteUrl}/#person` },
  };
}

/** Serialize JSON-LD safely for an inline <script>. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\u003c") });
