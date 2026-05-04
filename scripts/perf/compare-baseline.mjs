import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_BASELINE_PATH = 'lh-reports/perf-baseline.json'
const REPORTS_DIR = 'lh-reports'
const ROUTES = ['home', 'shop', 'product', 'cart']
const ROUTE_PATTERNS = {
  home: /^new-home-3101.*\.json$/i,
  shop: /^new-shop-3101.*\.json$/i,
  product: /^new-product-3101.*\.json$/i,
  cart: /^new-cart-3101.*\.json$/i,
}

function parseArgs(argv) {
  const args = { baseline: DEFAULT_BASELINE_PATH }
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i]
    if (token === '--baseline' && argv[i + 1]) {
      args.baseline = argv[i + 1]
      i += 1
    }
  }
  return args
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function toMs(value) {
  return Number.isFinite(value) ? Number(value) : 0
}

function extractMetrics(report) {
  const audits = report.audits ?? {}
  return {
    performance: Math.round((report.categories?.performance?.score ?? 0) * 100),
    fcp: toMs(audits['first-contentful-paint']?.numericValue),
    lcp: toMs(audits['largest-contentful-paint']?.numericValue),
    speedIndex: toMs(audits['speed-index']?.numericValue),
    tbt: toMs(audits['total-blocking-time']?.numericValue),
    cls: Number(audits['cumulative-layout-shift']?.numericValue ?? 0),
    tti: toMs(audits['interactive']?.numericValue),
  }
}

function fmtSec(ms) {
  return `${(ms / 1000).toFixed(2)} s`
}

function fmtMs(ms) {
  return `${Math.round(ms)} ms`
}

function fmtDeltaNum(value, unit = '') {
  const normalized = Number(value)
  const sign = normalized > 0 ? '+' : ''
  return `${sign}${normalized.toFixed(2)}${unit}`
}

function fmtDeltaInt(value, unit = '') {
  const normalized = Math.round(Number(value))
  const sign = normalized > 0 ? '+' : ''
  return `${sign}${normalized}${unit}`
}

function resolveCurrentReport(route, baselineFilePath) {
  const reportFiles = fs
    .readdirSync(REPORTS_DIR)
    .filter((name) => ROUTE_PATTERNS[route].test(name))
    .map((name) => {
      const absolutePath = path.join(REPORTS_DIR, name)
      const stat = fs.statSync(absolutePath)
      return {
        filePath: absolutePath,
        mtimeMs: stat.mtimeMs,
      }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)

  if (reportFiles.length === 0) {
    throw new Error(`No report files found for route: ${route}`)
  }

  const baselineNormalized = path.normalize(baselineFilePath)
  const firstDifferent = reportFiles.find((entry) => path.normalize(entry.filePath) !== baselineNormalized)
  return firstDifferent?.filePath ?? reportFiles[0].filePath
}

function main() {
  const args = parseArgs(process.argv)
  if (!fs.existsSync(args.baseline)) {
    throw new Error(`Baseline manifest not found: ${args.baseline}`)
  }

  const baselineManifest = readJson(args.baseline)
  const rows = []

  for (const route of ROUTES) {
    const baselinePath = baselineManifest[route]
    if (!baselinePath || !fs.existsSync(baselinePath)) {
      throw new Error(`Missing or invalid baseline path for ${route}: ${baselinePath ?? 'undefined'}`)
    }

    const currentPath = resolveCurrentReport(route, baselinePath)
    const baselineMetrics = extractMetrics(readJson(baselinePath))
    const currentMetrics = extractMetrics(readJson(currentPath))

    rows.push({
      route,
      baselinePath,
      currentPath,
      baseline: baselineMetrics,
      current: currentMetrics,
      delta: {
        performance: currentMetrics.performance - baselineMetrics.performance,
        fcp: currentMetrics.fcp - baselineMetrics.fcp,
        lcp: currentMetrics.lcp - baselineMetrics.lcp,
        speedIndex: currentMetrics.speedIndex - baselineMetrics.speedIndex,
        tbt: currentMetrics.tbt - baselineMetrics.tbt,
        cls: currentMetrics.cls - baselineMetrics.cls,
        tti: currentMetrics.tti - baselineMetrics.tti,
      },
    })
  }

  console.log('Lighthouse comparison vs locked baseline')
  console.log(`Baseline manifest: ${args.baseline}`)
  console.log('')
  console.log('| Page | Score | LCP | TBT | Speed Index |')
  console.log('|------|------:|----:|----:|------------:|')

  for (const row of rows) {
    const scoreText = `${row.baseline.performance} -> ${row.current.performance} (${fmtDeltaInt(row.delta.performance)})`
    const lcpText = `${fmtSec(row.baseline.lcp)} -> ${fmtSec(row.current.lcp)} (${fmtDeltaNum(row.delta.lcp / 1000, ' s')})`
    const tbtText = `${fmtMs(row.baseline.tbt)} -> ${fmtMs(row.current.tbt)} (${fmtDeltaInt(row.delta.tbt, ' ms')})`
    const siText = `${fmtSec(row.baseline.speedIndex)} -> ${fmtSec(row.current.speedIndex)} (${fmtDeltaNum(row.delta.speedIndex / 1000, ' s')})`
    const pageName = row.route.charAt(0).toUpperCase() + row.route.slice(1)

    console.log(`| ${pageName} | ${scoreText} | ${lcpText} | ${tbtText} | ${siText} |`)
  }

  console.log('')
  console.log('Resolved files:')
  for (const row of rows) {
    const pageName = row.route.charAt(0).toUpperCase() + row.route.slice(1)
    console.log(`- ${pageName}`)
    console.log(`  baseline: ${row.baselinePath}`)
    console.log(`  current:  ${row.currentPath}`)
  }
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
