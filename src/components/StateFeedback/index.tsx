import React from "react";
import { Link } from "react-router-dom";
import "./styles.scss";

type ActionProps = {
  label?: string;
  to?: string;
  onClick?: () => void;
};

type SkeletonBlockProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  /** "dark" for placeholders drawn on a dark surface (banners, page heroes) */
  tone?: "light" | "dark";
};

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = "",
  width,
  height,
  tone = "light",
}) => (
  <span
    className={`state-skeleton-block${tone === "dark" ? " state-skeleton-block--dark" : ""} ${className}`.trim()}
    style={{ width, height }}
    aria-hidden="true"
  />
);

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = "" }) => (
  <div className={`state-skeleton-text ${className}`.trim()} aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBlock
        key={index}
        className="state-skeleton-text__line"
        width={index === lines - 1 ? "72%" : "100%"}
      />
    ))}
  </div>
);

// Placeholder for components/Product: it reuses the product-tile frame (border, radius,
// square media, body padding) so the grid keeps its size when the real cards arrive
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`product-tile product-tile--skeleton ${className}`.trim()} aria-hidden="true">
    <div className="product-tile__media">
      <SkeletonBlock className="product-tile__skeleton-fill" />
    </div>
    <div className="product-tile__body">
      <SkeletonBlock className="product-tile__skeleton-line" width="34%" height={12} />
      <SkeletonBlock className="product-tile__skeleton-line" width="80%" height={18} />
      <span className="product-tile__skeleton-swatches">
        <SkeletonBlock width={16} height={16} />
        <SkeletonBlock width={16} height={16} />
      </span>
      <SkeletonBlock className="product-tile__skeleton-line" width="48%" height={20} />
    </div>
  </div>
);

export const PageSectionSkeleton: React.FC<{
  variant?: "product-grid" | "product-detail" | "cart-list" | "account-list";
  count?: number;
  className?: string;
}> = ({ variant = "product-grid", count = 4, className = "" }) => {
  if (variant === "product-detail") {
    return (
      <div
        className={`state-page-skeleton state-page-skeleton--detail ${className}`.trim()}
        aria-label="Đang tải nội dung"
      >
        <div className="container">
          {/* Mirrors ProductDetailPage: one large image over a row of two, then the info
              column (name, category, price, rating, stock, views, colours, quantity, button) */}
          <div className="state-detail-skeleton">
            <div className="state-detail-skeleton__gallery">
              <SkeletonBlock className="state-detail-skeleton__hero" />
              <div className="state-detail-skeleton__thumbs">
                <SkeletonBlock />
                <SkeletonBlock />
              </div>
            </div>
            <div className="state-detail-skeleton__content">
              <SkeletonBlock width="62%" height={26} />
              <SkeletonBlock width="24%" height={16} />
              <SkeletonBlock width="40%" height={26} />
              <SkeletonBlock width="48%" height={18} />
              <SkeletonBlock width="36%" height={14} />
              <SkeletonBlock width="56%" height={14} />
              <div className="state-detail-skeleton__swatches">
                <SkeletonBlock width={26} height={26} />
                <SkeletonBlock width={26} height={26} />
              </div>
              <SkeletonBlock width={120} height={40} />
              <SkeletonBlock width={200} height={48} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "cart-list" || variant === "account-list") {
    return (
      <div
        className={`state-page-skeleton state-page-skeleton--list ${className}`.trim()}
        aria-label="Đang tải nội dung"
      >
        {Array.from({ length: count }).map((_, index) => (
          <div className="state-list-skeleton" key={index}>
            <SkeletonBlock className="state-list-skeleton__image" />
            <div className="state-list-skeleton__content">
              <SkeletonText lines={3} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`state-page-skeleton state-page-skeleton--grid ${className}`.trim()}
      aria-label="Đang tải nội dung"
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

const ActionButton: React.FC<ActionProps & { className?: string }> = ({
  label,
  to,
  onClick,
  className = "",
}) => {
  if (!label) return null;

  if (to) {
    return (
      <Link className={className} to={to}>
        {label}
      </Link>
    );
  }

  return (
    <button className={className} type="button" onClick={onClick}>
      {label}
    </button>
  );
};

export const EmptyState: React.FC<{
  title: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
}> = ({
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  secondaryActionLabel,
  secondaryActionTo,
}) => (
  <div className="state-feedback state-feedback--empty">
    <div className="state-feedback__icon" aria-hidden="true">
      <span />
    </div>
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    <div className="state-feedback__actions">
      <ActionButton
        className="state-feedback__button state-feedback__button--primary"
        label={actionLabel}
        to={actionTo}
        onClick={onAction}
      />
      <ActionButton
        className="state-feedback__button state-feedback__button--secondary"
        label={secondaryActionLabel}
        to={secondaryActionTo}
      />
    </div>
  </div>
);

export const InlineErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="state-inline-error" role="status">
    <span>{message}</span>
    {onRetry && (
      <button type="button" onClick={onRetry}>
        Thử lại
      </button>
    )}
  </div>
);

export const RetryState: React.FC<{
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry: () => void;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
}> = ({
  title = "Không thể tải dữ liệu",
  message,
  actionLabel = "Thử lại",
  onRetry,
  secondaryActionLabel,
  secondaryActionTo,
}) => (
  <div className="state-feedback state-feedback--error" role="alert">
    <div className="state-feedback__icon" aria-hidden="true">
      <span />
    </div>
    <h3>{title}</h3>
    <p>{message}</p>
    <div className="state-feedback__actions">
      <ActionButton
        className="state-feedback__button state-feedback__button--primary"
        label={actionLabel}
        onClick={onRetry}
      />
      <ActionButton
        className="state-feedback__button state-feedback__button--secondary"
        label={secondaryActionLabel}
        to={secondaryActionTo}
      />
    </div>
  </div>
);
