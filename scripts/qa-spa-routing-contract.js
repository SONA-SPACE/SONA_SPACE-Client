const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function fail(message) {
  console.error(`FAIL: ${message}`)
  process.exitCode = 1
}

function pass(message) {
  console.log(`PASS: ${message}`)
}

function assertVercelRewrite() {
  const filePath = path.join(rootDir, 'vercel.json')
  if (!fs.existsSync(filePath)) {
    fail('vercel.json is missing from the client deployment root')
    return
  }

  const config = readJson(filePath)
  const rewrites = Array.isArray(config.rewrites) ? config.rewrites : []
  const hasSpaFallback = rewrites.some(
    (rewrite) => rewrite.source === '/(.*)' && rewrite.destination === '/index.html',
  )

  if (!hasSpaFallback) {
    fail('vercel.json must rewrite /(.*) to /index.html for BrowserRouter deep links')
    return
  }

  pass('vercel.json has SPA fallback rewrite')
}

function assertRouterContract() {
  const appPath = path.join(rootDir, 'src', 'App.tsx')
  const source = fs.readFileSync(appPath, 'utf8')

  if (!source.includes('<BrowserRouter')) {
    fail('src/App.tsx no longer uses BrowserRouter; review the SPA fallback contract')
    return
  }

  if (!source.includes('path="*"')) {
    fail('src/App.tsx is missing a wildcard app-level 404 route')
    return
  }

  pass('React Router uses BrowserRouter with an app-level 404 route')
}

function assertBuiltAssets() {
  const distDir = path.join(rootDir, 'dist')
  const indexPath = path.join(distDir, 'index.html')

  if (!fs.existsSync(indexPath)) {
    fail('dist/index.html is missing; run npm run build before qa:spa-routing')
    return
  }

  const html = fs.readFileSync(indexPath, 'utf8')
  const assetRefs = Array.from(html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)).map((match) => match[1])

  if (assetRefs.length === 0) {
    fail('dist/index.html does not reference built /assets files')
    return
  }

  const missingAssets = assetRefs.filter((assetRef) => {
    const localPath = path.join(distDir, assetRef.replace(/^\//, ''))
    return !fs.existsSync(localPath)
  })

  if (missingAssets.length > 0) {
    fail(`dist/index.html references missing assets: ${missingAssets.join(', ')}`)
    return
  }

  pass(`dist/index.html references ${assetRefs.length} existing built asset(s)`)
}

function assertNoRcVendorSplit() {
  const assetsDir = path.join(rootDir, 'dist', 'assets')

  if (!fs.existsSync(assetsDir)) {
    fail('dist/assets is missing; run npm run build before qa:spa-routing')
    return
  }

  const rcChunks = fs.readdirSync(assetsDir).filter((fileName) => /^vendor-rc-.*\.js$/.test(fileName))

  if (rcChunks.length > 0) {
    fail(`rc packages must not be split into a standalone vendor-rc chunk: ${rcChunks.join(', ')}`)
    return
  }

  pass('rc packages are not split into a standalone vendor-rc chunk')
}

assertVercelRewrite()
assertRouterContract()
assertBuiltAssets()
assertNoRcVendorSplit()

if (process.exitCode) {
  process.exit(process.exitCode)
}

console.log('SPA routing contract QA passed')
