// A3 perf trace: 4x CPU throttle, fps sampled over 5s at paper + vista.
const { chromium } = require('playwright-core')
const os = require('os')
const path = require('path')
const EXE = path.join(os.homedir(), '.cache/ms-playwright/chromium-1228/chrome-linux64/chrome')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fps(page, seconds = 5) {
  return page.evaluate(
    (s) =>
      new Promise((resolve) => {
        let frames = 0
        const start = performance.now()
        const tick = () => {
          frames++
          if (performance.now() - start < s * 1000) requestAnimationFrame(tick)
          else resolve(frames / s)
        }
        requestAnimationFrame(tick)
      }),
    seconds
  )
}

async function main() {
  const browser = await chromium.launch({ executablePath: EXE })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

  await page.goto('http://localhost:3000', { waitUntil: 'load' })
  await sleep(2000)
  console.log('paper @4x throttle:', (await fps(page)).toFixed(1), 'fps')

  // wiggle the cursor so the flock is active (worst case, no idle formation)
  for (let i = 0; i < 15; i++) {
    await page.mouse.move(300 + i * 60, 400 + (i % 3) * 100)
    await sleep(40)
  }
  console.log('paper active @4x:', (await fps(page)).toFixed(1), 'fps')

  // vista: step down so scene events fire
  for (let y = 0; y <= 5400; y += 300) {
    await page.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y)
    await sleep(120)
  }
  await sleep(2000)
  console.log('vista murmuration @4x:', (await fps(page)).toFixed(1), 'fps')

  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
