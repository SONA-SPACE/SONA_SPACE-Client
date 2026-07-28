const fs = require("fs");
const path = require("path");

const clientRoot = path.resolve(__dirname, "..");
const sourceRoots = ["src", "public"];
const forbiddenPattern = /(?:\.\.?\/)?public\/images|\/public\/images/g;

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(filePath);
    return /\.(css|scss|ts|tsx|js|jsx)$/.test(entry.name) ? [filePath] : [];
  });
}

const matches = sourceRoots
  .flatMap((sourceRoot) => collectFiles(path.join(clientRoot, sourceRoot)))
  .flatMap((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    return [...source.matchAll(forbiddenPattern)].map((match) => ({
      file: path.relative(clientRoot, filePath),
      index: match.index,
      value: match[0],
    }));
  });

if (matches.length > 0) {
  console.error("Found runtime asset paths that incorrectly include /public:");
  for (const match of matches) {
    console.error("- " + match.file + " (" + match.value + " at offset " + match.index + ")");
  }
  process.exit(1);
}

console.log("Public asset path contract passed.");
