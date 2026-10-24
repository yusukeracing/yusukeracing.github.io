import {
  CATEGORIES,
  asList,
  el,
  text,
  localDate,
  dateText,
  emptyState,
  paragraphs,
  photoFigure,
  validPhoto,
  siteBase,
  updateSchema,
} from "./ui.js";

function publishedArticles(data) {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());
  return asList(data.articles)
    .filter(
      (article) =>
        article &&
        text(article.id) &&
        text(article.title) &&
        localDate(article.date) &&
        article.date <= today &&
        CATEGORIES.includes(article.category),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
function row(article) {
  const anchor = el("a", undefined, "news-row");
  anchor.href = `news-detail.html?id=${encodeURIComponent(article.id)}`;
  const time = el("time", dateText(article.date), "news-date");
  time.dateTime = article.date;
  anchor.append(
    time,
    el("span", article.category, "news-category"),
    el("h3", article.title, "news-title"),
    el("span", "↗", "news-arrow"),
  );
  return anchor;
}
function metadata(article) {
  const title = `${article.title} | 池田優介`;
  const description = text(article.body).replace(/\s+/g, " ").slice(0, 140);
  const canonical = `${siteBase()}news-detail.html?id=${encodeURIComponent(article.id)}`;
  document.title = title;
  const setMeta = (selector, content) => {
    const node = document.querySelector(selector);
    if (node) node.content = content;
  };
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:type"]', "article");
  setMeta('meta[property="og:url"]', canonical);
  const canonicalNode = document.querySelector('link[rel="canonical"]');
  if (canonicalNode) canonicalNode.href = canonical;
  document.querySelector('meta[name="robots"]')?.remove();
  const schema = {
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    inLanguage: "ja",
    mainEntityOfPage: canonical,
    description,
  };
  if (text(article.author))
    schema.author = { "@type": "Person", name: article.author };
  if (validPhoto(article.photo))
    schema.image = new URL(article.photo.src, siteBase()).href;
  updateSchema(schema);
}

export function renderNews(data) {
  const articles = publishedArticles(data);
  const boxes = document.querySelectorAll("[data-news]");
  const filters = document.querySelectorAll("[data-news-filter]");
  let category =
    new URLSearchParams(location.search).get("category")?.toUpperCase() ||
    "ALL";
  if (!CATEGORIES.includes(category)) category = "ALL";
  const status = filters.length ? el("p", undefined, "visually-hidden") : null;
  if (status) {
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    boxes[0]?.before(status);
  }

  function render() {
    const filtered = articles.filter(
      (article) => category === "ALL" || article.category === category,
    );
    boxes.forEach((box) => {
      box.replaceChildren();
      const limit = Number.parseInt(box.dataset.limit, 10);
      if (!filtered.length)
        box.append(
          emptyState(
            category === "ALL"
              ? "次のニュースを、お待ちください。"
              : "このカテゴリーのお知らせはありません。",
            "レースの結果、活動の記録。確認済みの情報を順次お届けします。",
          ),
        );
      else
        filtered
          .slice(0, limit > 0 ? limit : filtered.length)
          .forEach((article) => box.append(row(article)));
    });
    filters.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String((button.dataset.newsFilter || "ALL").toUpperCase() === category),
      ),
    );
    if (status)
      status.textContent = `${category === "ALL" ? "すべて" : category}：${filtered.length}件`;
  }
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      category = (button.dataset.newsFilter || "ALL").toUpperCase();
      if (!CATEGORIES.includes(category)) category = "ALL";
      const url = new URL(location.href);
      if (category === "ALL") url.searchParams.delete("category");
      else url.searchParams.set("category", category.toLowerCase());
      history.replaceState(null, "", url);
      render();
    }),
  );
  render();

  const detail = document.querySelector("[data-news-detail]");
  if (!detail) return;
  const id = new URLSearchParams(location.search).get("id");
  const article = articles.find((item) => item.id === id);
  detail.replaceChildren();
  if (!article) {
    const robots =
      document.querySelector('meta[name="robots"]') ||
      document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    if (!robots.isConnected) document.head.append(robots);
    detail.append(
      emptyState(
        "記事が見つかりませんでした。",
        "記事が公開前、またはURLが変更された可能性があります。ニュース一覧からご覧ください。",
      ),
    );
    const back = el("a", "ニュース一覧へ ↗", "text-link");
    back.href = "news.html";
    detail.append(back);
    return;
  }
  const time = el("time", dateText(article.date));
  time.dateTime = article.date;
  const meta = el("div", undefined, "article-meta");
  meta.append(time, el("span", article.category));
  detail.append(meta, el("h2", article.title));
  const figure = photoFigure(article.photo);
  if (figure) detail.append(figure);
  const body = el("div", undefined, "article-body");
  paragraphs(body, article.body);
  detail.append(body);
  const back = el("a", "すべてのニュースへ ↗", "text-link");
  back.href = "news.html";
  detail.append(back);
  metadata(article);
}
