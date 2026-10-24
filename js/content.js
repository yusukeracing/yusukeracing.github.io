import {
  asList,
  el,
  text,
  safeUrl,
  external,
  emptyState,
  paragraphs,
  fillPhoto,
  photoFigure,
  validPhoto,
  updateSchema,
} from "./ui.js";
import { initSlider } from "./slider.js";

const SOCIAL_HOSTS = {
  Instagram: ["instagram.com", "www.instagram.com"],
  X: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  Threads: ["threads.net", "www.threads.net", "threads.com", "www.threads.com"],
  Facebook: ["facebook.com", "www.facebook.com", "m.facebook.com"],
};
const ICON_PATHS = {
  Instagram: [
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z",
    "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    "M17.5 6.5h.01",
  ],
  X: ["M4 3h4l12 18h-4L4 3Zm0 18L20 3"],
  Threads: [
    "M18.5 8C18 3 13 1 8.8 3 4.4 5 3.5 10 4.5 15 5.4 20 9 22 13.5 21c4-.7 6.5-3.4 6-6.4-.5-3.2-4.6-4.8-7.4-3.9-2.6.8-3 3.4-1 4.8 2.6 1.8 5.7-1.1 5-4.9-.5-2.9-3.8-4-6.4-2.4",
  ],
  Facebook: [
    "M15 22v-9h3l.5-4H15V6.5c0-1 .3-1.5 1.5-1.5H19V1.4A21 21 0 0 0 15.8 1C12.6 1 11 3 11 6.2V9H8v4h3v9",
  ],
};
function socialIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.6");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("social-icon");
  for (const d of ICON_PATHS[name]) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}
function renderSocials(values) {
  const links = Object.entries(SOCIAL_HOSTS)
    .map(([name, hosts]) => [name, safeUrl(values?.[name], { hosts })])
    .filter(([, url]) => url);
  document.querySelectorAll("[data-social]").forEach((box) => {
    box.replaceChildren();
    const compact = box.hasAttribute("data-social-compact");
    if (!links.length) {
      box.append(
        el(
          "span",
          compact ? "SNS準備中" : "公式SNSは、アカウント確認後にご案内します。",
          "social-pending",
        ),
      );
      return;
    }
    for (const [name, url] of links) {
      const anchor = external(name, url, "social-link");
      anchor.setAttribute("aria-label", `${name}（新しいタブで開きます）`);
      anchor.replaceChildren(socialIcon(name));
      if (!compact)
        anchor.append(el("span", name), el("span", "↗", "social-arrow"));
      box.append(anchor);
    }
  });
  return links.map(([, url]) => url);
}
function googleForm(value) {
  const url = safeUrl(value, { hosts: ["docs.google.com", "forms.gle"] });
  if (!url) return null;
  const parsed = new URL(url);
  if (parsed.hostname === "forms.gle")
    return parsed.pathname.length > 1 ? { url, embed: null } : null;
  if (
    !/^\/forms\/(?:d\/(?:e\/)?[^/]+|u\/\d+\/d\/(?:e\/)?[^/]+)\/viewform\/?$/.test(
      parsed.pathname,
    )
  )
    return null;
  const embedded = new URL(parsed.origin + parsed.pathname);
  embedded.searchParams.set("embedded", "true");
  return { url, embed: embedded.href };
}
function renderContact(value) {
  const config = value || {};
  const form = googleForm(config.url);
  document.querySelectorAll("[data-contact-categories]").forEach((node) => {
    const categories = asList(config.categories).filter(
      (item) => typeof item === "string" && item.trim(),
    );
    if (categories.length) {
      node.replaceChildren();
      categories.forEach((category) => node.append(el("li", category)));
    }
  });
  if (!form) return; // Preserve the honest, useful static unavailable state.
  document.querySelectorAll("[data-contact]").forEach((box) => {
    const panel = el("div", undefined, "contact-form-panel");
    panel.append(
      el("h3", "公式お問い合わせフォーム"),
      el(
        "p",
        "個人情報の取り扱いをご確認のうえ、Google Formsへお進みください。",
      ),
    );
    const link = external(
      "CONTACT FORM ↗",
      form.url,
      "button button--primary",
    );
    panel.append(link);
    if (config.mode === "embed" && form.embed) {
      const note = el(
        "p",
        "フォームを読み込むと、Googleへ接続します。外部ページで開くこともできます。",
        "form-privacy-note",
      );
      const load = el(
        "button",
        "このページにフォームを表示",
        "button button--outline contact-load-button",
      );
      load.type = "button";
      load.addEventListener(
        "click",
        () => {
          const iframe = el("iframe");
          iframe.src = form.embed;
          iframe.title = "池田優介 お問い合わせフォーム（Google Forms）";
          iframe.width = "100%";
          iframe.height = "900";
          iframe.loading = "lazy";
          iframe.referrerPolicy = "strict-origin-when-cross-origin";
          iframe.className = "google-form";
          iframe.addEventListener("load", () => {
            note.textContent =
              "Google Formsを表示しています。表示されない場合は上のボタンからお開きください。";
          });
          load.replaceWith(iframe);
        },
        { once: true },
      );
      panel.append(note, load);
    }
    box.replaceChildren(panel);
  });
}

export function renderProfile(profile) {
  for (const [field, selector] of [
    ["name", "[data-profile-name]"],
    ["englishName", "[data-profile-english-name]"],
    ["hometown", "[data-profile-hometown]"],
    ["description", "[data-profile-description]"],
  ]) {
    if (text(profile[field]))
      document
        .querySelectorAll(selector)
        .forEach((node) => (node.textContent = profile[field]));
  }
  const sameAs = renderSocials(profile.socials);
  if (document.body.dataset.page === "profile") {
    const person = {
      "@type": "Person",
      name: text(profile.name, "池田優介"),
      alternateName: text(profile.englishName, "YUSUKE IKEDA"),
      description: text(profile.description),
      homeLocation: { "@type": "Place", name: text(profile.hometown) },
    };
    if (sameAs.length) person.sameAs = sameAs;
    updateSchema(person);
  }
  document.querySelectorAll("[data-biography]").forEach((node) => {
    const biography = asList(profile.biography).filter(
      (item) => item && text(item.year) && text(item.text),
    );
    if (!biography.length) return;
    const list = el("dl", undefined, "biography-list");
    biography.forEach((item) =>
      list.append(el("dt", item.year), el("dd", item.text)),
    );
    node.replaceChildren(list);
  });
  const chapters = asList(profile.story).filter(
    (item) => item && text(item.title) && text(item.body),
  );
  if (chapters.length)
    document.querySelectorAll("[data-story]").forEach((node) => {
      node.replaceChildren();
      chapters.forEach((chapter, index) => {
        const article = el("article", undefined, "story-chapter");
        if (/^[a-z0-9-]+$/.test(chapter.id || "")) article.id = chapter.id;
        article.append(
          el(
            "p",
            `${String(index + 1).padStart(2, "0")} / ${text(chapter.label)}`,
            "story-step",
          ),
          el("h2", chapter.title),
        );
        const body = el("div", undefined, "story-chapter-body");
        paragraphs(body, chapter.body);
        article.append(body);
        const figure = photoFigure(chapter.photo);
        if (figure) article.append(figure);
        node.append(article);
      });
    });
  fillPhoto(
    '[data-photo="profile"], [data-profile-photo]',
    profile.photos?.profile,
  );
  fillPhoto('[data-photo="story"], [data-story-photo]', profile.photos?.story);
  const photos = asList(profile.photos?.moments).filter(validPhoto);
  document.querySelectorAll("[data-moments]").forEach((node) => {
    if (!photos.length) return;
    const limit = Number.parseInt(node.dataset.limit, 10);
    node.replaceChildren();
    node.classList.add("moments-grid");
    photos
      .slice(0, limit > 0 ? limit : photos.length)
      .forEach((photo) => node.append(photoFigure(photo)));
  });
  initSlider(profile.photos?.hero);
  if (asList(profile.photos?.hero).some(validPhoto))
    document
      .querySelectorAll(".hero-photo-status")
      .forEach(
        (node) => (node.textContent = "YUSUKE IKEDA / RACE PHOTOGRAPHY"),
      );
  renderContact(profile.contact);
}

export function renderSponsors(data) {
  const partners = asList(data.partners).filter(
    (partner) => partner && text(partner.name),
  );
  document.querySelectorAll("[data-partners]").forEach((node) => {
    if (!partners.length) return;
    const list = el("div", undefined, "partner-list");
    for (const partner of partners) {
      const url = safeUrl(partner.url);
      const item = url
        ? external(partner.name, url, "partner-logo")
        : el("span", partner.name, "partner-logo");
      const logo = safeUrl(partner.logo, { local: true });
      if (logo) {
        const image = el("img");
        image.src = logo;
        image.alt = text(partner.alt, partner.name);
        image.width = 220;
        image.height = 100;
        image.loading = "lazy";
        image.addEventListener(
          "error",
          () => item.replaceChildren(el("span", partner.name)),
          { once: true },
        );
        item.replaceChildren(image);
      }
      list.append(item);
    }
    node.replaceChildren(list);
  });
  const metrics = asList(data.metrics).filter(
    (metric) =>
      metric &&
      text(metric.label) &&
      ["string", "number"].includes(typeof metric.value) &&
      text(metric.period) &&
      text(metric.source),
  );
  document.querySelectorAll("[data-metrics]").forEach((node) => {
    if (!metrics.length) return;
    node.replaceChildren();
    metrics.forEach((metric) => {
      const item = el("div", undefined, "metric-item");
      item.append(
        el("strong", metric.value, "metric-value"),
        el("span", metric.label, "metric-label"),
        el("small", `${metric.period} / 出典：${metric.source}`),
      );
      node.append(item);
    });
  });
  const deck = safeUrl(data.deckUrl, { local: true });
  if (deck && /\.pdf$/i.test(new URL(deck).pathname))
    document.querySelectorAll("[data-sponsor-deck]").forEach((node) => {
      const anchor = el("a", "SPONSOR DECK / PDF ↗", "button button--outline");
      anchor.href = deck;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      node.replaceChildren(anchor);
    });
}
