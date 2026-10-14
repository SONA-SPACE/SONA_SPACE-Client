import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function ArrowRight() {
  return (
    <svg className="arrow-right" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  action?: { label: string; to: string };
  align?: "left" | "center";
}

export default function SectionHeading({ title, eyebrow, description, action, align = "left" }: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}`} data-reveal>
      <div className="section-heading__text">
        {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
        <h2 className="section-heading__title">{title}</h2>
        {description && <p className="section-heading__description">{description}</p>}
      </div>
      {action && (
        <Link to={action.to} className="section-heading__action" data-magnetic="0.25">
          {action.label}
          <ArrowRight />
        </Link>
      )}
    </div>
  );
}
