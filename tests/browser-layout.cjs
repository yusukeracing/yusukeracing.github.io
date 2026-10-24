// Optional development test: requires Playwright and Chromium. SITE_BASE selects the running site.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const base = process.env.SITE_BASE || "http://127.0.0.1:8010/";
  const out = process.env.SCREENSHOT_DIR || "/tmp/yusuke-v2-screens";
  require("fs").mkdirSync(out, { recursive: true });
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const errors = [];
  const results = [];
  for (const width of [320, 390, 768, 1366, 1920]) {
    const p = await b.newPage({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
    });
    p.on("pageerror", (e) => errors.push(`${width}: ${e.message}`));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push(`${width}: ${m.text()}`);
    });
    p.on("response", (r) => {
      if (r.status() >= 400)
        errors.push(`${width}: HTTP ${r.status()} ${r.url()}`);
    });
    for (const slug of [
      "index",
      "profile",
      "story",
      "race",
      "news",
      "news-detail",
      "gallery",
      "support",
      "sponsor",
      "contact",
      "privacy",
      "404",
    ]) {
      await p.goto(base + slug + ".html");
      await p.waitForFunction(
        () => document.documentElement.dataset.contentReady === "true",
      );
      await p.evaluate(() => document.fonts.ready);
      const state = await p.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        mainCount: document.querySelectorAll("main").length,
        h1Count: document.querySelectorAll("h1").length,
        hasCss: getComputedStyle(document.body).fontFamily.includes(
          "Noto Sans JP",
        ),
        font: document.fonts.check('600 20px "Barlow Condensed"'),
      }));
      if (state.overflow) errors.push(`${width}: overflow ${slug}`);
      if (
        !state.hasCss ||
        !state.font ||
        state.h1Count !== 1 ||
        state.mainCount !== 1
      )
        errors.push(
          `${width}: layout/semantic ${slug} ${JSON.stringify(state)}`,
        );
      if (slug === "index")
        await p.screenshot({
          path: `${out}/home-${width}.png`,
          fullPage: true,
        });
    }
    if (width === 390) {
      await p.click("[data-menu-toggle]");
      assert.equal(
        await p.getAttribute("[data-menu-toggle]", "aria-expanded"),
        "true",
      );
      await p.keyboard.press("Escape");
      assert.equal(
        await p.getAttribute("[data-menu-toggle]", "aria-expanded"),
        "false",
      );
      await p.goto(base + "news.html");
      await p.waitForFunction(
        () => document.documentElement.dataset.contentReady === "true",
      );
      await p.click('[data-news-filter="RACE"]');
      assert.equal(
        await p.getAttribute('[data-news-filter="RACE"]', "aria-pressed"),
        "true",
      );
      assert.match(p.url(), /category=race/);
    }
    results.push(
      `${width}px: 12 pages, fonts/styles, semantic structure, no horizontal overflow`,
    );
    await p.close();
  }
  await b.close();
  console.log(JSON.stringify({ base, results, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
})();
