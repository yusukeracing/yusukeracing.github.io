import { siteData } from "./site-data.js";

/* =========================
   SAFE CONTENT HELPERS
========================= */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
// Only same-origin relative asset paths and HTTPS external destinations are accepted.
function assetPath(value) {
  if (
    typeof value !== "string" ||
    !value ||
    /^[\\/]|^[a-z][a-z\d+.-]*:/i.test(value)
  )
    return null;
  const url = new URL(value, document.baseURI);
  return url.origin === location.origin && !value.split("/").includes("..")
    ? url.href
    : null;
}
function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function externalLink(href, text, className = "text-link") {
  const link = element("a", className, text);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
$$("[data-current-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
$$("[data-team]").forEach((node) => {
  node.textContent = siteData.team || "正式発表後に掲載予定";
});
$$("[data-category]").forEach((node) => {
  node.textContent = siteData.category || "正式発表後に掲載予定";
});

/* =========================
   MOBILE MENU / KEYBOARD
========================= */
const menu = $(".menu-toggle");
const navigation = $("#primary-nav");
function setMenu(open) {
  menu.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}
menu.addEventListener("click", () =>
  setMenu(menu.getAttribute("aria-expanded") !== "true"),
);
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (menu.getAttribute("aria-expanded") !== "true") return;
  if (event.key === "Escape") {
    setMenu(false);
    menu.focus();
  }
  if (event.key === "Tab") {
    const focusable = [menu, ...$$("a", navigation)];
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
window.matchMedia("(min-width: 821px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

/* =========================
   PHOTO SLIDESHOW
========================= */
const slideshow = $("[data-slideshow]");
if (slideshow) {
  const photos = siteData.heroImages.filter((photo) => assetPath(photo.src));
  const controls = $(".slideshow-controls");
  const buttons = $("[data-slide-buttons]");
  const pause = $("[data-slide-pause]");
  let index = 0,
    timer = null,
    paused = reducedMotion.matches;
  if (photos.length) {
    slideshow.replaceChildren();
    const images = photos.map((photo, i) => {
      const img = element("img", "hero-slide" + (i === 0 ? " is-active" : ""));
      img.src = assetPath(photo.src);
      img.alt = photo.alt || "池田優介のレース活動";
      img.width = 1672;
      img.height = 941;
      img.decoding = "async";
      if (i === 0) img.fetchPriority = "high";
      slideshow.append(img);
      return img;
    });
    const indicators = photos.map((photo, i) => {
      const button = element("button", "slide-dot");
      button.type = "button";
      button.setAttribute("aria-label", `写真${i + 1}を表示`);
      button.addEventListener("click", () => {
        show(i);
        schedule();
      });
      buttons.append(button);
      return button;
    });
    function show(next) {
      // A missing photograph never replaces a valid visible slide.
      if (!images[next].complete || !images[next].naturalWidth) return;
      index = next;
      images.forEach((img, i) => {
        img.classList.toggle("is-active", i === index);
        img.setAttribute("aria-hidden", String(i !== index));
      });
      indicators.forEach((button, i) =>
        button.setAttribute("aria-pressed", String(i === index)),
      );
      $("[data-slide-count]").textContent =
        `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
      $("[data-image-caption]").textContent = photos[index].illustrative
        ? "イメージビジュアル / 本人写真ではありません"
        : photos[index].caption || "YUSUKE IKEDA";
    }
    function schedule() {
      clearInterval(timer);
      timer = null;
      if (
        !paused &&
        !document.hidden &&
        !reducedMotion.matches &&
        photos.length > 1
      ) {
        timer = setInterval(() => show((index + 1) % photos.length), 6000);
      }
      pause.textContent = paused || reducedMotion.matches ? "▶" : "Ⅱ";
      pause.setAttribute(
        "aria-label",
        paused || reducedMotion.matches
          ? "写真の自動切替を再開"
          : "写真の自動切替を一時停止",
      );
      pause.setAttribute("aria-pressed", String(paused));
      pause.disabled = reducedMotion.matches;
      if (reducedMotion.matches)
        pause.setAttribute(
          "aria-label",
          "動きを減らす設定により自動切替は停止中",
        );
    }
    images[0].addEventListener("load", () => show(0), { once: true });
    if (images[0].complete) show(0);
    indicators[0].setAttribute("aria-pressed", "true");
    indicators
      .slice(1)
      .forEach((node) => node.setAttribute("aria-pressed", "false"));
    controls.hidden = photos.length < 2;
    pause.addEventListener("click", () => {
      paused = !paused;
      schedule();
    });
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", () => {
      paused = reducedMotion.matches;
      schedule();
    });
    schedule();
  } else {
    controls.hidden = true;
  }
}

/* =========================
   SOCIAL / SUPPORT DESTINATIONS
========================= */
const socials = [
  ["instagram", "Instagram"],
  ["x", "X"],
  ["threads", "Threads"],
  ["facebook", "Facebook"],
];
$$("[data-social-links]").forEach((container) => {
  socials.forEach(([key, name]) => {
    const url = httpsUrl(siteData.social[key]);
    if (url) {
      const link = externalLink(url, name, "social-link");
      link.setAttribute(
        "aria-label",
        `${name}で池田優介をフォロー（新しいタブで開きます）`,
      );
      link.append(element("span", "", "↗"));
      container.append(link);
    } else {
      const item = element("span", "social-unavailable", name);
      item.append(element("small", "", "準備中"));
      container.append(item);
    }
  });
});
const supportUrl = httpsUrl(siteData.supportUrl);
if (supportUrl && $("[data-support-reception]")) {
  const box = $("[data-support-reception]");
  box.replaceChildren(element("h3", "jp-heading", "個人支援の受付はこちら。"));
  box.append(
    element(
      "p",
      "body-copy",
      "支援先で受付条件・金額・利用規約をご確認ください。",
    ),
  );
  box.append(
    externalLink(supportUrl, "正式な支援ページへ ↗", "button button-primary"),
  );
}
const pdf = $("[data-sponsor-pdf]");
if (pdf && assetPath(siteData.sponsorPdf)) {
  pdf.href = assetPath(siteData.sponsorPdf);
  pdf.hidden = false;
}

/* =========================
   PROFILE / RACING HISTORY
========================= */
const career = $("[data-career]");
if (career) {
  siteData.career.forEach((item) => {
    const article = element("article", "timeline-item");
    article.append(element("span", "timeline-year", item.year));
    const body = element("div");
    body.append(
      element("h3", "", item.title),
      element("p", "", item.description),
    );
    article.append(body);
    career.append(article);
  });
}
const results = $("[data-results]");
if (results) {
  const years = [...new Set(siteData.seasonResults.map((row) => row.year))]
    .sort()
    .reverse();
  const filters = $("[data-result-filters]");
  function showResults(year) {
    results.replaceChildren();
    siteData.seasonResults
      .filter((row) => year === "ALL" || row.year === year)
      .forEach((row) => {
        const tr = element("tr");
        ["year", "championship", "category", "result"].forEach((key) =>
          tr.append(element("td", "", row[key])),
        );
        results.append(tr);
      });
    $$("button", filters).forEach((button) => {
      const active = button.dataset.year === year;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  ["ALL", ...years].forEach((year) => {
    const button = element("button", "filter-button", year);
    button.type = "button";
    button.dataset.year = year;
    button.addEventListener("click", () => showResults(year));
    filters.append(button);
  });
  showResults("ALL");
}

/* =========================
   RACE SCHEDULE / JST COUNTDOWN
========================= */
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function raceEnd(race) {
  return Date.parse(`${race.endDate || race.date}T23:59:59+09:00`);
}
const races = siteData.races
  .filter(
    (race) => datePattern.test(race.date) && Number.isFinite(raceEnd(race)),
  )
  .sort((a, b) => a.date.localeCompare(b.date));
const upcoming = races.filter((race) => raceEnd(race) >= Date.now());
const nextRace = upcoming[0];
if (nextRace) {
  $$("[data-next-race]").forEach((box) => {
    $("[data-next-date]", box).textContent = nextRace.date.replaceAll("-", ".");
    $("[data-next-circuit]", box).textContent = nextRace.circuit;
    $("[data-next-detail]", box).textContent = [
      nextRace.championship,
      nextRace.category,
    ]
      .filter(Boolean)
      .join(" / ");
    const countdown = $("[data-countdown]", box);
    function updateCountdown() {
      const delta = Date.parse(`${nextRace.date}T00:00:00+09:00`) - Date.now();
      const days = Math.ceil(delta / 86400000);
      countdown.textContent =
        days > 0
          ? `${days} DAYS TO GO / 開催まであと${days}日`
          : "RACE WEEK / 開催日程を迎えています";
      countdown.hidden = false;
    }
    updateCountdown();
    setInterval(updateCountdown, 60000);
  });
}
const schedule = $("[data-schedule]");
if (schedule && upcoming.length) {
  schedule.replaceChildren();
  upcoming.forEach((race) => {
    const card = element("article", "schedule-card");
    const date = element(
      "div",
      "schedule-date",
      race.date.replaceAll("-", "."),
    );
    date.append(element("small", "", race.round || "RACE"));
    card.append(date);
    const body = element("div");
    body.append(
      element("span", "status", race.championship),
      element("h3", "", race.circuit),
      element("p", "", race.category || "クラスは発表後に掲載"),
    );
    card.append(body);
    const url = httpsUrl(race.url);
    if (url)
      card.append(
        externalLink(url, "主催者の公式案内 ↗", "button button-outline"),
      );
    schedule.append(card);
  });
}
const raceResults = $("[data-race-results]");
if (raceResults) {
  races
    .filter((race) => race.result || race.qualifying)
    .reverse()
    .forEach((race) => {
      const card = element("article", "race-result");
      card.append(
        element(
          "h3",
          "",
          `${race.date.replaceAll("-", ".")} / ${race.circuit}`,
        ),
      );
      card.append(
        element(
          "p",
          "",
          `${race.category || ""}  予選：${race.qualifying || "未掲載"} / 決勝：${race.result || "未掲載"}`,
        ),
      );
      raceResults.append(card);
    });
}

/* =========================
   NEWS / FILTER / ARTICLE
========================= */
const newsList = $("[data-news-list]");
const homeNews = $("[data-home-news]");
const categoryLabels = {
  race: "RACE REPORT",
  activity: "ACTIVITY",
  sponsor: "PARTNERS",
  media: "MEDIA",
};
const articles = [...siteData.news].sort((a, b) =>
  b.date.localeCompare(a.date),
);
function newsCard(article, home = false) {
  const card = element("article", "news-card");
  if (assetPath(article.image)) {
    const img = element("img");
    img.src = assetPath(article.image);
    img.alt = article.title;
    img.loading = "lazy";
    card.append(img);
  } else {
    card.append(
      element(
        "div",
        "news-art race-art",
        categoryLabels[article.category] || "NEWS",
      ),
    );
  }
  card.append(
    element("span", "news-tag", categoryLabels[article.category] || "NEWS"),
  );
  const time = element("time", "", article.date.replaceAll("-", "."));
  time.dateTime = article.date;
  card.append(time);
  const heading = element("h3", "", article.title);
  const summary = element("p", "", article.summary);
  if (home) {
    const link = element("a");
    link.href = `news.html?article=${encodeURIComponent(article.id)}`;
    link.append(heading, summary);
    card.append(link);
  } else {
    const button = element("button");
    button.type = "button";
    button.append(heading, summary);
    button.addEventListener("click", () => openArticle(article));
    card.append(button);
  }
  return card;
}
if (homeNews && articles.length)
  homeNews.replaceChildren(
    ...articles.slice(0, 3).map((article) => newsCard(article, true)),
  );
function showNews(category) {
  const filtered = articles.filter(
    (article) => category === "all" || article.category === category,
  );
  newsList.replaceChildren();
  if (filtered.length)
    filtered.forEach((article) => newsList.append(newsCard(article)));
  else {
    const box = element("div", "empty-state");
    box.append(
      element("span", "status", "COMING SOON"),
      element("h3", "", "活動報告は、公開準備中です。"),
      element("p", "", "確認済みの情報を、こちらでお知らせします。"),
    );
    newsList.append(box);
  }
  $$("[data-news-filter]").forEach((button) => {
    const active = button.dataset.newsFilter === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("[data-news-status]").textContent =
    `${categoryLabels[category] || "すべて"}：${filtered.length}件`;
}
const dialog = $("[data-news-dialog]");
function openArticle(article) {
  if (!dialog) return;
  const content = $("[data-article-content]");
  content.replaceChildren(
    element(
      "p",
      "eyebrow",
      `${article.date} / ${categoryLabels[article.category] || "NEWS"}`,
    ),
    element("h2", "", article.title),
  );
  if (assetPath(article.image)) {
    const img = element("img");
    img.src = assetPath(article.image);
    img.alt = article.title;
    content.append(img);
  }
  content.append(element("p", "article-body", article.body || article.summary));
  dialog.showModal();
}
if (newsList) {
  const query = new URLSearchParams(location.search);
  showNews(
    categoryLabels[query.get("category")] ? query.get("category") : "all",
  );
  $$("[data-news-filter]").forEach((button) =>
    button.addEventListener("click", () => showNews(button.dataset.newsFilter)),
  );
  $("[data-dialog-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (
      event.target === dialog &&
      (event.offsetX < 0 ||
        event.offsetX > dialog.clientWidth ||
        event.offsetY < 0 ||
        event.offsetY > dialog.clientHeight)
    )
      dialog.close();
  });
  const selected = articles.find(
    (article) => article.id === query.get("article"),
  );
  if (selected) openArticle(selected);
}

/* =========================
   CONTACT / NO SERVER STORAGE
========================= */
const form = $("#contact-form");
if (form) {
  const validEmail = /^[^\s@?&#\r\n]+@[^\s@?&#\r\n]+\.[^\s@?&#\r\n]+$/.test(
    siteData.email,
  );
  const type = new URLSearchParams(location.search).get("type");
  if ([...form.elements.type.options].some((option) => option.value === type))
    form.elements.type.value = type;
  if (validEmail)
    $("[data-contact-availability]").textContent =
      "入力内容を確認した後、メールアプリで下書きを作成できます。メールアプリから送信してください。";
  const confirmation = $("[data-contact-confirmation]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const inquiry = form.elements.type.selectedOptions[0].textContent;
    const fields = [
      ["お名前", data.get("name")],
      ["会社名", data.get("company") || "未記入"],
      ["メールアドレス", data.get("email")],
      ["電話番号", data.get("phone") || "未記入"],
      ["お問い合わせ内容", inquiry],
      ["本文", data.get("message")],
    ];
    const summary = $("[data-contact-summary]");
    summary.replaceChildren();
    fields.forEach(([key, value]) => {
      const row = element("div");
      row.append(element("dt", "", key), element("dd", "", value));
      summary.append(row);
    });
    const compose = $("[data-compose-mail]");
    compose.hidden = !validEmail;
    if (validEmail) {
      const body = fields
        .map(([key, value]) => `${key}：${value}`)
        .join("\n\n");
      compose.href = `mailto:${siteData.email}?subject=${encodeURIComponent("[池田優介Webサイト] " + inquiry)}&body=${encodeURIComponent(body)}`;
    }
    $("[data-contact-status]").textContent = validEmail
      ? "内容をご確認のうえ、メールアプリで下書きを作成してください。送信はメールアプリから行います。"
      : "連絡先は準備中のため、まだ送信できません。入力内容は送信・保存されていません。";
    confirmation.hidden = false;
    form.hidden = true;
    confirmation.setAttribute("tabindex", "-1");
    confirmation.focus();
  });
  $("[data-edit-contact]").addEventListener("click", () => {
    confirmation.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
}

/* =========================
   SUBTLE SCROLL REVEALS
========================= */
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  document.body.classList.add("motion-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  $$(".reveal").forEach((node) => observer.observe(node));
}
