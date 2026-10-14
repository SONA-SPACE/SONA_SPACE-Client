import { Link } from "react-router-dom";
import { ArrowRight } from "../SectionHeading";

interface MediaTileProps {
  to: string;
  image: string;
  title: string;
  ctaLabel?: string;
  large?: boolean;
  className?: string;
}

const FALLBACK_IMAGE = "/images/hero-banner.png";

// Full-bleed photo tile with a caption and CTA; the whole tile is one link.
export default function MediaTile({
  to,
  image,
  title,
  ctaLabel = "Xem Sản Phẩm",
  large,
  className = "",
}: MediaTileProps) {
  return (
    <Link to={to} className={`media-tile${large ? " media-tile--large" : ""} ${className}`.trim()} data-reveal>
      <img
        src={image || FALLBACK_IMAGE}
        alt=""
        loading="lazy"
        decoding="async"
        onError={(event) => {
          const target = event.currentTarget;
          if (!target.src.endsWith(FALLBACK_IMAGE)) target.src = FALLBACK_IMAGE;
        }}
      />
      <span className="media-tile__content">
        <span className="media-tile__title">{title}</span>
        <span className="media-tile__cta">
          {ctaLabel}
          <ArrowRight />
        </span>
      </span>
    </Link>
  );
}
