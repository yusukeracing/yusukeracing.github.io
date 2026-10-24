// Optional development test: requires Playwright and Chromium. Never modifies production data.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const p = await b.newPage({
    reducedMotion: "reduce",
    viewport: { width: Number(process.env.TEST_WIDTH || 390), height: 844 },
  });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  const base = process.env.SITE_BASE || "http://127.0.0.1:8010/";
  const fixtures = {
    profile: {
      name: "池田優介",
      englishName: "YUSUKE IKEDA",
      hometown: "宮城県角田市",
      description: "test",
      biography: [{ year: "2025", text: "test" }],
      story: [
        {
          id: "start",
          label: "START",
          title: "Test",
          body: "Plain <script> test",
        },
      ],
      photos: {
        hero: [
          { src: "images/ogp.png", alt: "first" },
          { src: "images/ogp.png", alt: "second" },
        ],
        profile: { src: "images/ogp.png", alt: "profile" },
        story: null,
        moments: [{ src: "images/ogp.png", alt: "moment", credit: "TEST" }],
      },
      socials: {
        Instagram: "https://www.instagram.com/test",
        X: "javascript:alert(1)",
        Facebook: "https://evil.example/facebook",
        Threads: "https://www.threads.net/@test",
      },
      contact: {
        mode: "embed",
        url: "https://docs.google.com/forms/d/e/123test/viewform",
        categories: ["取材", "その他"],
      },
    },
    races: {
      season: 2026,
      nextRaceId: "next",
      races: [
        {
          id: "latest",
          date: "2026-01-01",
          round: "ROUND01",
          circuit: "Circuit A",
          status: "completed",
          result: "P3",
        },
        {
          id: "next",
          date: "2030-01-01",
          startAt: "2030-01-01T10:00:00+09:00",
          round: "ROUND02",
          circuit: "Circuit B",
          schedule: "09:00 Warmup",
          category: "TEST",
          officialUrl: "https://example.com/race",
          mapsUrl: "https://www.google.com/maps",
        },
      ],
    },
    news: {
      articles: [
        {
          id: "xss",
          date: "2026-01-01",
          category: "RACE",
          title: "<img src=x onerror=alert(1)>",
          body: "Text\n\nMore text",
        },
        {
          id: "activity",
          date: "2026-02-01",
          category: "ACTIVITY",
          title: "Activity",
          body: "Body",
        },
        {
          id: "future",
          date: "2030-01-01",
          category: "MEDIA",
          title: "Future",
          body: "future",
        },
      ],
    },
    sponsors: {
      partners: [
        { name: "Sponsor", url: "https://example.com", logo: "images/ogp.png" },
      ],
      metrics: [
        {
          label: "Followers",
          value: 25,
          period: "2026-01",
          source: "Test analytics",
        },
      ],
      deckUrl: null,
    },
  };
  await p.route("**/data/*.json", (r) =>
    r.fulfill({
      json: fixtures[r.request().url().split("/").pop().replace(".json", "")],
    }),
  );
  const ready = async () => {
    await p.waitForSelector('html[data-content-ready="true"]');
    await p.evaluate(() => document.fonts.ready);
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      "Populated page overflows at " + p.url(),
    );
  };
  await p.goto(base);
  await ready();
  assert.equal(await p.locator("[data-hero-slides] img").count(), 2);
  assert.equal(
    await p.locator("[data-slider-toggle]").textContent(),
    "スライドを再生",
  );
  assert.match(await p.locator("[data-next-race]").textContent(), /Circuit B/);
  assert.equal(await p.locator("[data-news] .news-row").count(), 2);
  assert.equal(await p.locator('a[href^="javascript:"]').count(), 0);
  assert.equal(await p.locator(".news-row img").count(), 0);
  assert.match(await p.locator("[data-latest-result]").textContent(), /P3/);
  assert.equal(await p.locator("[data-countdown]").isVisible(), true);
  if (Number(process.env.TEST_WIDTH || 390) < 1100) {
    await p.locator("[data-menu-toggle]").click();
    assert.equal(await p.locator("#site-nav").isVisible(), true);
    await p.keyboard.press("Escape");
    assert.equal(
      await p.locator("[data-menu-toggle]").getAttribute("aria-expanded"),
      "false",
    );
  }
  await p.goto(base + "news.html?category=race");
  await ready();
  assert.equal(await p.locator(".news-row").count(), 1);
  await p.locator(".news-row").click();
  await ready();
  assert.match(
    await p.locator("[data-news-detail]").textContent(),
    /More text/,
  );
  assert.equal(await p.locator("meta[name=robots]").count(), 0);
  assert.match(await p.locator("#page-schema").textContent(), /Article/);
  await p.goto(base + "race.html");
  await ready();
  assert.equal(await p.locator(".race-event").count(), 2);
  await p.locator(".race-event summary").first().click();
  assert.equal(await p.locator(".race-event").first().getAttribute("open"), "");
  assert.match(await p.locator("#page-schema").textContent(), /SportsEvent/);
  await p.goto(base + "profile.html");
  await ready();
  assert.match(await p.locator("#page-schema").textContent(), /sameAs/);
  await p.goto(base + "contact.html");
  await ready();
  assert.equal(await p.locator("[data-contact] iframe").count(), 0);
  await p.route("https://docs.google.com/**", (r) =>
    r.fulfill({
      body: "<html><body>form</body></html>",
      contentType: "text/html",
    }),
  );
  await p.locator(".contact-load-button").click();
  assert.equal(await p.locator("[data-contact] iframe").count(), 1);
  assert.match(
    await p.locator("[data-contact] iframe").getAttribute("src"),
    /embedded=true/,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS runtime fixtures; safe text/socials/slider/news/race/countdown/schema/forms/menu",
  );
  await b.close();
})();
