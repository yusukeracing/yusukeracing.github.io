/** Shared DOM, URL and data utilities. No JSON content is interpreted as HTML. */
export const CATEGORIES = [
  "RACE",
  "RESULT",
  "ACTIVITY",
  "EVENT",
  "MEDIA",
  "SPONSOR",
  "INFORMATION",
];

export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}

export function safeUrl(value, { local = false, hosts = null } = {}) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim(), document.baseURI);
    if (url.username || url.password) return null;
    if (local)
      return url.origin === location.origin &&
        ["http:", "https:"].includes(url.protocol)
        ? url.href
        : null;
    if (url.protocol !== "https:" || (hosts && !hosts.includes(url.hostname)))
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export function external(text, value, className = "text-link") {
  const url = safeUrl(value);
  if (!url) return null;
  const link = el("a", text, className);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

export function emptyState(title, detail, { error = false } = {}) {
  const box = el("div", undefined, "empty-state" + (error ? " is-error" : ""));
  if (error) box.setAttribute("role", "status");
  box.append(el("h3", title), el("p", detail));
  return box;
}

/** A future CMS adapter can replace this loader without changing renderers. */
export async function loadData(name) {
  const response = await fetch(
    new URL(`../data/${name}.json`, import.meta.url),
  );
  if (!response.ok) throw new Error(`${name}.json: HTTP ${response.status}`);
  const data = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error(`${name}.json: オブジェクト形式が必要です`);
  return data;
}

export function asList(value) {
  return Array.isArray(value) ? value : [];
}
export function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
export function localDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}
export function dateText(value) {
  return localDate(value)?.replaceAll("-", ".") || "日程確認中";
}

export function paragraphs(container, value) {
  for (const paragraph of text(value)
    .split(/\n\s*\n/)
    .filter(Boolean))
    container.append(el("p", paragraph));
}

function safeSrcset(value) {
  if (typeof value !== "string") return null;
  const candidates = value.split(",").map((entry) => entry.trim().split(/\s+/));
  if (
    !candidates.length ||
    candidates.some(
      ([path, size, ...extra]) =>
        extra.length ||
        !safeUrl(path, { local: true }) ||
        !/^[1-9]\d*(?:\.\d+)?[wx]$/.test(size || ""),
    )
  )
    return null;
  return candidates
    .map(([path, size]) => `${safeUrl(path, { local: true })} ${size}`)
    .join(", ");
}

export function validPhoto(photo) {
  return (
    photo &&
    typeof photo === "object" &&
    text(photo.alt) &&
    safeUrl(photo.src, { local: true })
  );
}

export function photoImage(
  photo,
  {
    hero = false,
    first = false,
    sizes = "(max-width: 767px) 100vw, 50vw",
  } = {},
) {
  if (!validPhoto(photo)) return null;
  const image = el("img");
  image.src = safeUrl(photo.src, { local: true });
  image.alt = text(photo.alt);
  image.width =
    Number.isFinite(photo.width) && photo.width > 0 ? photo.width : 1600;
  image.height =
    Number.isFinite(photo.height) && photo.height > 0 ? photo.height : 1067;
  image.decoding = "async";
  if (hero) image.fetchPriority = first ? "high" : "low";
  else image.loading = "lazy";
  const srcset = safeSrcset(photo.srcset);
  if (srcset) {
    image.srcset = srcset;
    image.sizes = sizes;
  }
  return image;
}

export function photoFigure(photo, options = {}) {
  const image = photoImage(photo, options);
  if (!image) return null;
  const figure = el("figure", undefined, "photo-item");
  if (asList(photo.sources).length) {
    const picture = el("picture");
    for (const source of photo.sources) {
      const srcset = safeSrcset(source.srcset);
      if (!srcset || !["image/avif", "image/webp"].includes(source.type))
        continue;
      const node = el("source");
      node.type = source.type;
      node.srcset = srcset;
      node.sizes = options.sizes || "(max-width: 767px) 100vw, 50vw";
      picture.append(node);
    }
    picture.append(image);
    figure.append(picture);
  } else figure.append(image);
  const caption = el("figcaption", undefined, "photo-caption");
  const info = [
    text(photo.round),
    localDate(photo.date) ? dateText(photo.date) : "",
    text(photo.circuit),
    text(photo.caption),
  ].filter(Boolean);
  if (info.length) caption.append(el("span", info.join(" / ")));
  if (text(photo.credit))
    caption.append(
      el("small", `PHOTOGRAPHY / ${photo.credit}`, "photo-credit"),
    );
  if (caption.children.length) figure.append(caption);
  image.addEventListener(
    "error",
    () => {
      figure.replaceChildren(
        emptyState(
          "写真を読み込めませんでした。",
          "画像ファイルを確認後、改めて掲載します。",
        ),
      );
      figure.classList.add("photo-unavailable");
    },
    { once: true },
  );
  return figure;
}

export function fillPhoto(selector, value) {
  if (!validPhoto(value)) return;
  document.querySelectorAll(selector).forEach((slot) => {
    const figure = photoFigure(value);
    if (slot.tagName === "FIGURE") {
      // Keep the original photoFigure node: its error handler must remain attached
      // to the same visible figure, rather than a detached temporary container.
      for (const attribute of slot.attributes) {
        if (attribute.name.startsWith("data-") || attribute.name === "id")
          figure.setAttribute(attribute.name, attribute.value);
      }
      for (const className of slot.classList)
        if (!className.startsWith("photo-placeholder"))
          figure.classList.add(className);
      slot.replaceWith(figure);
    } else slot.replaceChildren(figure);
  });
}

export function siteBase() {
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  return canonical
    ? new URL("./", canonical).href
    : new URL("./", location.href).href;
}

export function updateSchema(node) {
  const script = document.querySelector("#page-schema");
  if (!script) return;
  let current;
  try {
    current = JSON.parse(script.textContent);
  } catch {
    current = { "@context": "https://schema.org", "@graph": [] };
  }
  const graph = Array.isArray(current["@graph"])
    ? current["@graph"]
    : [
        Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== "@context"),
        ),
      ];
  const index = graph.findIndex((item) => item["@type"] === node["@type"]);
  if (index >= 0) graph[index] = node;
  else graph.push(node);
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}
