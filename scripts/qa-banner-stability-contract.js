const fs = require("fs");
const path = require("path");

const clientRoot = path.resolve(__dirname, "..");
const componentPath = path.join(
  clientRoot,
  "src",
  "components",
  "BannerSlider",
  "index.tsx"
);
const stylesPath = path.join(
  clientRoot,
  "src",
  "components",
  "BannerSlider",
  "styles.scss"
);

const componentSource = fs.readFileSync(componentPath, "utf8");
const stylesSource = fs.readFileSync(stylesPath, "utf8");

const checks = [
  {
    name: "fallback banner points to an existing public asset",
    pass: /const fallbackBannerImage = "\/images\/hero-banner\.png";/.test(
      componentSource
    ),
  },
  {
    name: "loading banner uses the shape-matched skeleton container",
    pass: /className="banner-text banner-text--skeleton"/.test(componentSource),
  },
  {
    name: "skeleton reserves subtitle, title, description, and button shapes",
    pass:
      [
        "banner-skeleton__subtitle",
        "banner-skeleton__title",
        "banner-skeleton__description",
        "banner-skeleton__button",
      ].every((className) => componentSource.includes(className)),
  },
  {
    name: "banner text no longer enters with layout-shifting transforms",
    pass:
      !/animation:\s*slideInLeft/.test(stylesSource) &&
      !/animation:\s*fadeInUp/.test(stylesSource),
  },
  {
    name: "banner skeleton dimensions are defined in component styles",
    pass:
      /\.banner-text--skeleton/.test(stylesSource) &&
      /\.banner-skeleton__title/.test(stylesSource) &&
      /\.banner-skeleton__button/.test(stylesSource),
  },
  {
    name: "reduced-motion users do not get banner image transforms",
    pass:
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.banner-image img[\s\S]*?transition:\s*none/.test(
        stylesSource
      ),
  },
];

const failedChecks = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"}: ${check.name}`);
}

if (failedChecks.length > 0) {
  console.error(
    `Banner stability contract failed: ${failedChecks.length}/${checks.length} checks failed.`
  );
  process.exit(1);
}

console.log(`Banner stability contract passed: ${checks.length} checks.`);
