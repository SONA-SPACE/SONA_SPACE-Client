import PageHero from "../PageHero";
import { PageSectionSkeleton, SkeletonBlock } from "../StateFeedback";

interface ListingPageSkeletonProps {
  /** Class of the page root, so page-level spacing applies while loading */
  pageClassName: string;
  /** Class of the section that holds the filter and the grid on the loaded page */
  sectionClassName: string;
  /** How many filter dropdowns the loaded page shows */
  filterCount?: number;
}

// Loading state of a product listing page (category, room): page hero, filter bar and product
// grid drawn with the real wrappers and filter classes, so nothing moves when the data arrives
export default function ListingPageSkeleton({
  pageClassName,
  sectionClassName,
  filterCount = 3,
}: ListingPageSkeletonProps) {
  return (
    <div className={pageClassName} aria-busy="true">
      <PageHero title="" loading />
      <section className={sectionClassName}>
        <div className="container">
          <div className="filter-row" aria-hidden="true">
            <div className="filter-left">
              <SkeletonBlock width={64} height={18} />
              {Array.from({ length: filterCount }).map((_, index) => (
                <div className="filter-dropdown" key={index}>
                  <SkeletonBlock width="100%" height={40} />
                </div>
              ))}
            </div>
            <div className="filter-right">
              <SkeletonBlock width={156} height={44} />
              <SkeletonBlock width={120} height={44} />
            </div>
          </div>
        </div>
        <div className="boxProducts">
          <div className="container">
            <div className="section-box-products">
              <PageSectionSkeleton count={8} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
