const fs = require("fs");
const path = require("path");

const scssRoot = path.resolve(__dirname, "..", "src", "styles");

function collectScssFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? collectScssFiles(entryPath)
      : entry.name.endsWith(".scss")
        ? [entryPath]
        : [];
  });
}

const importUsages = collectScssFiles(scssRoot).flatMap((filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  return source.includes("@import")
    ? [path.relative(scssRoot, filePath)]
    : [];
});

const entrySource = fs.readFileSync(path.join(scssRoot, "style.scss"), "utf8");
const checks = [
  {
    name: "legacy Sass imports are removed",
    pass: importUsages.length === 0,
  },
  {
    name: "the SCSS entrypoint uses the module system",
    pass: entrySource.includes('@use "imports/core/reset";'),
  },
  {
    name: "numeric 404 partial has an explicit valid namespace",
    pass: entrySource.includes('@use "imports/pages/404" as page404;'),
  },
];

const failedChecks = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"}: ${check.name}`);
}

if (importUsages.length > 0) {
  console.error(`SCSS files still using @import: ${importUsages.join(", ")}`);
}

if (failedChecks.length > 0) {
  process.exit(1);
}

console.log(`Sass module contract passed: ${checks.length} checks.`);
