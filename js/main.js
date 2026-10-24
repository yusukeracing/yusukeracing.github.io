import { el, emptyState, loadData } from "./ui.js";
import { renderProfile, renderSponsors } from "./content.js";
import { renderRaces } from "./race.js";
import { renderNews } from "./news.js";

// HEADER / NAVIGATION: keyboard, outside-click and responsive reset.
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("#site-nav");
const wide = matchMedia("(min-width: 1100px)");
function setMenu(open) {
  if (!toggle || !nav) return;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute(
    "aria-label",
    open ? "メニューを閉じる" : "メニューを開く",
  );
  nav.classList.toggle("is-open", open);
  const symbol = toggle.querySelector(".menu-toggle-symbol");
  if (symbol) symbol.textContent = open ? "−" : "＋";
}
if (toggle && nav) {
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenu(false);
  });
  nav.querySelectorAll("a").forEach((anchor) => {
    if (anchor.getAttribute("href") === `${document.body.dataset.page}.html`)
      anchor.setAttribute("aria-current", "page");
    anchor.addEventListener("click", () => setMenu(false));
  });
  wide.addEventListener("change", () => setMenu(false));
}
// FOOTER
const year = new Intl.DateTimeFormat("en", {
  year: "numeric",
  timeZone: "Asia/Tokyo",
}).format(new Date());
document
  .querySelectorAll("[data-year]")
  .forEach((node) => (node.textContent = year));

function failed(name, error) {
  console.error(`データを読み込めませんでした (${name})`, error);
  const selectors = {
    profile: "[data-contact], [data-story], [data-biography]",
    races: "[data-races], [data-race-detail]",
    news: "[data-news], [data-news-detail]",
    sponsors: "[data-partners], [data-metrics]",
  };
  document
    .querySelectorAll(selectors[name])
    .forEach((node) =>
      node.replaceChildren(
        emptyState(
          "情報を読み込めませんでした。",
          "時間をおいてページを読み直してください。",
          { error: true },
        ),
      ),
    );
  if (name === "profile")
    document
      .querySelectorAll("[data-social]")
      .forEach((node) =>
        node.replaceChildren(
          el("span", "SNS情報を読み込めませんでした。", "social-pending"),
        ),
      );
}

// DATA ADAPTERS: renderers receive ordinary JSON; a CMS can replace loadData later.
const tasks = [
  ["profile", renderProfile],
  ["races", renderRaces],
  ["news", renderNews],
  ["sponsors", renderSponsors],
];
await Promise.all(
  tasks.map(async ([name, render]) => {
    try {
      render(await loadData(name));
    } catch (error) {
      failed(name, error);
    }
  }),
);
document.documentElement.dataset.contentReady = "true";
