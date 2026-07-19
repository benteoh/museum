// Visual pass for the liquid-ink boids lab (A2/B3).
const { chromium } = require('playwright-core')
const os = require('os')
const path = require('path')

const EXE = path.join(os.homedir(), '.cache/ms-playwright/chromium-1228/chrome-linux64/chrome')
const OUT = __dirname
const URL = 'http://localhost:3000'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function wrapperZ(page) {
  return page.evaluate(() => {
    const c = document.querySelector('canvas[class*="gooCanvas"], canvas[class*="canvas"]')
    return c?.parentElement?.style.zIndex ?? null
  })
}

async function main() {
  const browser = await chromium.launch({ executablePath: EXE })

  // ——— Desktop 1440×900 ———
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(URL, { waitUntil: 'load' })
  await sleep(1200)

  // 1. paper scene, ambient drift (before the 3s idle ring kicks in)
  await page.mouse.move(700, 450)
  await sleep(800)
  await page.screenshot({ path: `${OUT}/01-paper-ambient.png` })

  // 2. cursor disturbance — sweep through the flock
  for (let i = 0; i <= 20; i++) {
    await page.mouse.move(300 + i * 40, 450 + Math.sin(i / 3) * 120)
    await sleep(30)
  }
  await page.screenshot({ path: `${OUT}/02-paper-disturbance.png` })

  // 3. idle ring after 3s+ without movement (plus formation time — the
  // W_FORMATION pull is deliberately weak)
  await sleep(12000)
  await page.screenshot({ path: `${OUT}/03-paper-idle-ring.png` })

  // 4. scroll to the vista: advance until the wrapper drops to zIndex 1
  const maxY = await page.evaluate(() => document.body.scrollHeight - innerHeight)
  let vistaY = null
  for (let y = 0; y <= maxY; y += 300) {
    await page.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y)
    await sleep(250)
    if ((await wrapperZ(page)) === '1') { vistaY = y; break }
  }
  console.log('vista entered at scrollY =', vistaY, '/', maxY)
  if (vistaY === null) throw new Error('never reached vista scene')
  // settle one viewport INTO the section so frames are on screen and the
  // scene is stably vista, not the entry/exit boundary
  await page.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), vistaY + 900)
  await sleep(400)
  console.log('settled z =', await wrapperZ(page))

  await sleep(1500) // release: banding + remainder fade
  await page.screenshot({ path: `${OUT}/04-vista-release.png` })
  await sleep(8000) // settled murmuration (travel + fusion time)
  await page.screenshot({ path: `${OUT}/05-vista-murmuration-settled.png` })

  // 5. deeper into the rail — frames advancing under the flock
  await page.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), vistaY + 1800)
  await sleep(2500)
  console.log('mid-rail wrapper zIndex =', await wrapperZ(page))
  await page.screenshot({ path: `${OUT}/06-vista-mid-rail.png` })

  // 6. reverse scroll back to the top — everyone free again over paper
  await page.evaluate(() => scrollTo(0, 0))
  await sleep(1500)
  console.log('back at top wrapper zIndex =', await wrapperZ(page))
  await page.screenshot({ path: `${OUT}/07-paper-return.png` })

  // console errors?
  await page.close()

  // ——— Mobile 375×800 ———
  const mob = await browser.newPage({ viewport: { width: 375, height: 800 } })
  await mob.goto(URL, { waitUntil: 'load' })
  await sleep(1200)
  await mob.screenshot({ path: `${OUT}/08-mobile-paper.png` })
  const maxYm = await mob.evaluate(() => document.body.scrollHeight - innerHeight)
  let vistaYm = null
  const zs = []
  for (let y = 0; y <= maxYm; y += 400) {
    await mob.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y)
    await sleep(600)
    // The Overture's spring emits 'desk' for a beat after a large jump; a
    // small follow-up scroll (as real touch scrolling produces constantly)
    // lets the Vision section re-publish.
    await mob.evaluate(() => scrollBy({ top: 6, behavior: 'instant' }))
    await sleep(300)
    const z = await wrapperZ(mob)
    zs.push(`${y}:${z}`)
    if (z === '1') { vistaYm = y; break }
  }
  console.log('mobile vista at', vistaYm, '/', maxYm, '|', zs.join(' '))
  if (vistaYm !== null) {
    await sleep(3000)
    await mob.screenshot({ path: `${OUT}/09-mobile-vista.png` })
  }
  await browser.close()
  console.log('done')
}

main().catch((e) => { console.error(e); process.exit(1) })
