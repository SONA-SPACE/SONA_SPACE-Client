import { useRef } from "react";
import { Link } from "react-router-dom";
import { useRegisterHeaderHero } from "../../hooks/useHeaderHero";
import { SkeletonBlock } from "../StateFeedback";
import { optimizedImageSrcSet, optimizedImageUrl } from "../../utils/image";
import "./styles.scss";

type Crumb = { label: string; to?: string };

interface PageHeroProps {
  title: string;
  image?: string;
  breadcrumbs?: Crumb[];
  /** Same height and dark surface, with placeholders instead of the image and text */
  loading?: boolean;
}

// Compact image header for task pages (auth, cart, account): sets context without pushing
// the page's real content below the fold.
export default function PageHero({
  title,
  image = "/images/hero-banner.png",
  breadcrumbs,
  loading = false,
}: PageHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useRegisterHeaderHero(sectionRef);

  if (loading) {
    return (
      <section ref={sectionRef} className="page-hero page-hero--loading" aria-busy="true" aria-label="Đang tải">
        <div className="container page-hero__content">
          <SkeletonBlock tone="dark" width={180} height={14} className="page-hero__skeleton-crumbs" />
          <SkeletonBlock tone="dark" width="min(420px, 70%)" height={40} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="page-hero">
      {/* Faded in once decoded (data-loaded) so a large banner never paints in strips */}
      <img
        className="page-hero__image"
        src={optimizedImageUrl(image, 1920)}
        srcSet={optimizedImageSrcSet(image)}
        sizes="100vw"
        alt=""
        decoding="async"
        fetchPriority="high"
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) node.setAttribute("data-loaded", "");
        }}
        onLoad={(event) => event.currentTarget.setAttribute("data-loaded", "")}
        onError={(event) => event.currentTarget.setAttribute("data-loaded", "")}
      />
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
