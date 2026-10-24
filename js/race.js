import {
  asList,
  el,
  text,
  localDate,
  dateText,
  emptyState,
  external,
  photoFigure,
  updateSchema,
  siteBase,
  safeUrl,
} from "./ui.js";

function dateOrder(race) {
  return localDate(race.date) || "9999-99-99";
}
function usableRaces(data) {
  return asList(data.races).filter((race) => race && text(race.id));
}
function resultText(race) {
  return text(race.result) || text(race.final);
}
function fact(list, label, value) {
  list.append(el("dt", label), el("dd", text(value, "確定後にお知らせします")));
}

function eventBody(race) {
  const body = el("div", undefined, "race-event-body");
  const list = el("dl", undefined, "race-facts");
  fact(list, "DATE", localDate(race.date) ? dateText(race.date) : null);
  fact(list, "CIRCUIT", race.circuit);
  fact(list, "LOCATION", race.location);
  fact(list, "CATEGORY", race.category);
  fact(list, "SCHEDULE", race.schedule);
  fact(list, "ACCESS", race.access);
  fact(list, "SPECTATOR", race.spectator);
  fact(list, "QUALIFY", race.qualify);
  fact(list, "FINAL", race.final);
  fact(list, "RESULT", race.result);
  body.append(list);
  const links = el("div", undefined, "race-links");
  for (const [key, label] of [
    ["officialUrl", "公式大会ページ ↗"],
    ["mapsUrl", "Google Maps ↗"],
  ]) {
    const anchor = external(label, race[key]);
    if (anchor) links.append(anchor);
  }
  if (links.children.length) body.append(links);
  const figure = photoFigure(race.photo);
  if (figure) body.append(figure);
  return body;
}

function nextRace(data, races) {
  const chosen = races.find((race) => race.id === data.nextRaceId);
  if (!chosen || ["completed", "cancelled"].includes(chosen.status))
    return null;
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());
  if (localDate(chosen.date) && chosen.date < today) return null;
  return chosen;
}

function countdown(race) {
  const nodes = document.querySelectorAll("[data-countdown]");
  if (!nodes.length || !race) return;
  // A date alone has no start time: do not silently invent midnight or timezone.
  const value = text(race.startAt);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  )
    return;
  const start = Date.parse(value);
  if (!Number.isFinite(start) || start <= Date.now()) return;
  let timer;
  const render = () => {
    const remaining = Math.max(0, Math.ceil((start - Date.now()) / 60000));
    const days = Math.floor(remaining / 1440),
      hours = Math.floor((remaining % 1440) / 60),
      minutes = remaining % 60;
    nodes.forEach((node) => {
      node.hidden = false;
      node.replaceChildren(
        el("span", `${days} DAYS`, "countdown-value"),
        el(
          "span",
          `${String(hours).padStart(2, "0")} HOURS`,
          "countdown-value",
        ),
        el(
          "span",
          `${String(minutes).padStart(2, "0")} MINUTES`,
          "countdown-value",
        ),
      );
    });
    if (!remaining) {
      clearInterval(timer);
      nodes.forEach(
        (node) =>
          (node.textContent =
            "開催予定時刻になりました。最新情報は大会公式ページをご確認ください。"),
      );
    }
  };
  render();
  timer = setInterval(render, 30000);
}

export function renderRaces(data) {
  const races = usableRaces(data).sort((a, b) =>
    dateOrder(a).localeCompare(dateOrder(b)),
  );
  const chosen = nextRace(data, races);
  document.querySelectorAll("[data-season]").forEach((node) => {
    if (Number.isInteger(data.season)) node.textContent = String(data.season);
  });
  document.querySelectorAll("[data-next-race]").forEach((node) => {
    if (!chosen) return; // Keep meaningful static preparation state supplied by the page.
    node.replaceChildren(
      el("p", text(chosen.round, "NEXT ROUND"), "eyebrow"),
      el("h2", text(chosen.circuit, "会場確認中"), "race-next-heading"),
      el(
        "p",
        [dateText(chosen.date), text(chosen.category)]
          .filter(Boolean)
          .join(" / "),
        "race-next-meta",
      ),
    );
  });
  document.querySelectorAll("[data-races]").forEach((node) => {
    node.replaceChildren();
    if (!races.length) {
      node.append(
        emptyState(
          "次のスタートを、ここで。",
          "参戦予定・サーキット・クラスは、公式発表と本人確認後にお知らせします。",
        ),
      );
      return;
    }
    const limit = Number.parseInt(node.dataset.limit, 10);
    for (const race of races.slice(0, limit > 0 ? limit : races.length)) {
      const item = el("details", undefined, "race-event");
      const summary = el("summary", undefined, "race-event-summary");
      summary.append(
        el("span", text(race.round, "ROUND"), "race-round"),
        el("span", text(race.circuit, "会場確認中"), "race-circuit"),
        el("span", dateText(race.date), "race-date"),
        el("span", "+", "race-expand"),
      );
      item.append(summary, eventBody(race));
      node.append(item);
    }
  });
  const detail = document.querySelector("[data-race-detail]");
  if (detail && chosen) {
    detail.replaceChildren(
      el("p", text(chosen.round, "NEXT ROUND"), "eyebrow"),
      el("h2", text(chosen.circuit, "会場確認中")),
      eventBody(chosen),
    );
    if (localDate(chosen.date)) {
      const event = {
        "@type": "SportsEvent",
        name: `${text(chosen.round, "全日本ロードレース選手権")} / ${text(chosen.circuit, "レース")}`,
        startDate: text(chosen.startAt, chosen.date),
        location: {
          "@type": "Place",
          name: text(chosen.circuit),
          address: text(chosen.location),
        },
        eventStatus:
          chosen.status === "postponed"
            ? "https://schema.org/EventPostponed"
            : "https://schema.org/EventScheduled",
        url: safeUrl(chosen.officialUrl) || `${siteBase()}race.html`,
      };
      updateSchema(event);
    }
  }
  const latest = [...races]
    .filter(
      (race) =>
        resultText(race) &&
        localDate(race.date) &&
        race.date <=
          new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
            new Date(),
          ),
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latest)
    document.querySelectorAll("[data-latest-result]").forEach((node) => {
      node.replaceChildren(
        el(
          "p",
          `${dateText(latest.date)} / ${text(latest.circuit)}`,
          "eyebrow",
        ),
        el("h3", resultText(latest)),
        el("p", text(latest.category)),
      );
      const official = external(
        "公式リザルトを確認する ↗",
        latest.officialUrl,
      );
      if (official) node.append(official);
    });
  countdown(chosen);
}
