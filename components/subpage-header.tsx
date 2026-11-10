import Link from "next/link";
import { content } from "@/content";
import { DocIcon } from "./icons";

/** Header for pages outside the one-page home: home link, a back link and the résumé. */
export function SubpageHeader({ back }: { back: { href: string; label: string } }) {
  return (
    <header className="case-header" id="top">
      <Link className="wordmark" href="/">LG<span className="sr-only"> Lakshya Gupta, home</span></Link>
      <nav aria-label="Page">
        <Link href={back.href}>← {back.label}</Link>
        <a href={content.person.resume} download data-track="resume_download"><DocIcon /> Résumé</a>
      </nav>
    </header>
  );
}
