const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.resolve(__dirname, "..", "src", "pages", "HomePage", "index.tsx"),
  "utf8"
);

const checks = [
  {
    name: "home product loading uses the shared grid skeleton",
    pass: /loading && <PageSectionSkeleton count=\{8\} \/>/.test(source),
  },
  {
    name: "home product failure exposes a retry action",
    pass:
      /!loading && error && \([\s\S]*?<RetryState[\s\S]*?fetchNewestProducts/.test(
        source
      ),
  },
  {
    name: "home product empty response has a useful action",
    pass:
      /!loading && !error && newestProducts\.length === 0[\s\S]*?<EmptyState/.test(
        source
      ),
  },
  {
    name: "hot-product selection is stable across unrelated renders",
    pass: /const hotProducts = useMemo\(\(\) => getRandomProducts\(4\)/.test(
      source
    ),
  },
  {
    name: "legacy text loading indicator is removed",
    pass: !/className="loading-indicator"/.test(source),
  },
];

const failedChecks = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"}: ${check.name}`);
}

if (failedChecks.length > 0) {
  console.error(
    `Home product state contract failed: ${failedChecks.length}/${checks.length} checks failed.`
  );
  process.exit(1);
}

console.log(`Home product state contract passed: ${checks.length} checks.`);
