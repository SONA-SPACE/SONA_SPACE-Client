import { useRef } from "react";
import { Link } from "react-router-dom";
import { useRegisterHeaderHero } from "../../hooks/useHeaderHero";
import "./styles.scss";

type Crumb = { label: string; to?: string };

interface PageHeroProps {
  title: string;
  image?: string;
  breadcrumbs?: Crumb[];
}

// Compact image header for task pages (auth, cart, account): sets context without pushing
// the page's real content below the fold.
export default function PageHero({
  title,
  image = "/images/hero-banner.png",
  breadcrumbs,
}: PageHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useRegisterHeaderHero(sectionRef);

  return (
    <section ref={sectionRef} className="page-hero">
      <img className="page-hero__image" src={image} alt="" decoding="async" fetchPriority="high" />
      <div className="page-hero__scrim" aria-hidden="true" />
      <div className="container page-hero__content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="page-hero__breadcrumbs" aria-label="Breadcrumb">
            <ol>
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`}>
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="page-hero__title">{title}</h1>
      </div>
    </section>
  );
}
