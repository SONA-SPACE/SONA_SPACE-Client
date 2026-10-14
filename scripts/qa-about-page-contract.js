const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "src/pages/ContactForm/index.tsx"), "utf8");
const app = fs.readFileSync(path.join(root, "src/App.tsx"), "utf8");
const layout = fs.readFileSync(path.join(root, "src/layouts/SiteLayout.tsx"), "utf8");
// The about route must sit inside the shared SiteLayout route, which owns header, footer and <main>
const layoutRoutes = app.slice(app.indexOf("<Route element={<SiteLayout />}>"), app.indexOf("</Route>", app.indexOf("<Route element={<SiteLayout />}>")));
const style = fs.readFileSync(path.join(root, "src/styles/imports/pages/_about.scss"), "utf8");
const globalStyle = fs.readFileSync(path.join(root, "src/styles/style.scss"), "utf8");

const requiredAssets = [
  "/images/about/about-hero-living-room.png",
  "/images/about/project-thao-dien-dining.png",
  "/images/about/project-sunwah-pearl-living.png",
  "/images/about/project-ho-tram-bedroom.png",
  "/images/about/cta-vase-transparent.png",
];

const assertions = [
  [page.includes("<div className=\"about-page\">") && !page.includes("<main"), "page renders an about root inside the layout's <main>"],
  [
    layout.includes("<Header />") &&
      layout.includes("<Footer />") &&
      layout.includes("<main") &&
      layoutRoutes.includes('<Route path="/lien-he" element={<ContactForm />} />'),
    "existing shell remains mounted through SiteLayout",
  ],
  [page.includes("sendContactFormService") && page.includes("validateContactForm"), "existing contact service and validation are retained"],
  [page.includes("<form") && page.includes("onSubmit={handleSubmit}"), "contact form remains submit-capable"],
  [
    ["fullName", "email", "phone", "message", "agreeToTerms"].every((field) => page.includes(`name=\"${field}\"`)),
    "all existing contact fields remain available",
  ],
  [page.includes("setIsLoading") && page.includes("disabled={isLoading}"), "submission loading state remains available"],
  [
    globalStyle.includes('@use "imports/pages/about";'),
    "about SCSS is loaded from the global entry",
  ],
  ...requiredAssets.map((asset) => [page.includes(asset), `page references ${asset}`]),
  [
    style.includes("@include mixins.xs") &&
      style.includes("@include mixins.sm"),
    "responsive SCSS breakpoints are defined",
  ],
  [!style.includes("--about-"), "about page uses the shared Sass color tokens"],
  [style.includes("$dark-cl") && style.includes("$yellow-cl") && style.includes("$text-gray"), "about page uses the shared brand palette"],
  [page.includes("about-button--primary"), "about actions use the project primary-button treatment"],
  [style.includes("border-radius: 4px") && style.includes('font-family: "Be-M"'), "about buttons follow the shared button shape and typeface"],
  [style.includes("position: sticky") && style.includes("--height-header"), "contact introduction stays visible beside the desktop form"],
  [page.includes('viewBox="0 0 32 32"'), "process uses the redesigned compact line icons"],
];

const failures = assertions.filter(([passed]) => !passed).map(([, message]) => message);
if (failures.length > 0) {
  console.error("About page contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`About page contract passed (${assertions.length} checks).`);
