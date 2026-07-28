const fs = require("fs");
const path = require("path");

const clientRoot = path.resolve(__dirname, "..");
const productPageSource = fs.readFileSync(
  path.join(clientRoot, "src", "pages", "ProductPage", "index.tsx"),
  "utf8"
);
const filterSource = fs.readFileSync(
  path.join(clientRoot, "src", "components", "filter", "index.tsx"),
  "utf8"
);

const checks = [
  {
    name: "URL search parameters are the product filter source of truth",
    pass:
      /const searchParamsKey = searchParams\.toString\(\);/.test(
        productPageSource
      ) &&
      /useEffect\(\(\) => \{[\s\S]*?getFiltersFromSearchParams\(searchParams\)[\s\S]*?\}, \[searchParamsKey\]\);/.test(
        productPageSource
      ),
  },
  {
    name: "filter changes update browser history through setSearchParams",
    pass:
      /const handleFilterChange[\s\S]*?setSearchParams\(nextParams\)/.test(
        productPageSource
      ),
  },
  {
    name: "load-more pagination remains local and is not written to history",
    pass:
      !/params\.page\s*=/.test(productPageSource) &&
      /fetchProducts\(nextPage, filters, true\)/.test(productPageSource),
  },
  {
    name: "filter controls receive URL-restored initial values",
    pass:
      /<Filter[\s\S]*?initialFilters=\{filters\}/.test(productPageSource) &&
      /initialFilters\?:/.test(filterSource),
  },
  {
    name: "filter control state resynchronizes on Back and Forward navigation",
    pass:
      /useEffect\(\(\) => \{[\s\S]*?setCurrentFilters\(initialFilters\)[\s\S]*?\}, \[initialFilters\]\);/.test(
        filterSource
      ),
  },
  {
    name: "filter toggles expose native keyboard and expanded-state semantics",
    pass:
      /<button[\s\S]*?className="dropdown-toggle"[\s\S]*?aria-expanded=/.test(
        filterSource
      ) &&
      /<button[\s\S]*?className="sort-toggle"[\s\S]*?aria-expanded=/.test(
        filterSource
      ) &&
      !/<div\s+className="(?:dropdown|sort)-toggle"/.test(filterSource),
  },
  {
    name: "filter options use native buttons instead of click-only divs",
    pass:
      /<button[\s\S]*?className={`dropdown-item/.test(filterSource) &&
      /<button[\s\S]*?className="dropdown-item clear-item"/.test(filterSource),
  },
];

const failedChecks = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"}: ${check.name}`);
}

if (failedChecks.length > 0) {
  console.error(
    `Product filter history contract failed: ${failedChecks.length}/${checks.length} checks failed.`
  );
  process.exit(1);
}

console.log(`Product filter history contract passed: ${checks.length} checks.`);
