import { asList, photoImage, validPhoto, text } from "./ui.js";

/** HERO: 6 second cross dissolve; no timer when there is only one image. */
export function initSlider(input) {
  const root = document.querySelector("[data-hero-slides]");
  if (!root) return;
  const photos = asList(input).filter(validPhoto).slice(0, 5);
  if (!photos.length) return;
  const control = document.querySelector("[data-slider-toggle]");
  const progress = document.querySelector("[data-slider-progress]");
  const caption = document.querySelector("[data-slider-caption]");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = motion.matches;
  let index = 0;
  let timer = null;
  const images = [];
  root.replaceChildren();

  function display() {
    if (!images.length) {
      root.classList.remove("has-photos");
      if (control) control.hidden = true;
      if (progress) progress.textContent = "RIDER PHOTOGRAPHY / 準備中";
      return;
    }
    index = Math.max(0, Math.min(index, images.length - 1));
    images.forEach((item, position) => {
      item.image.classList.toggle("is-active", position === index);
      item.image.setAttribute("aria-hidden", String(position !== index));
    });
    root.classList.add("has-photos");
    if (progress)
      progress.textContent = `${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    if (caption)
      caption.textContent = text(images[index].photo.credit)
        ? `PHOTOGRAPHY / ${images[index].photo.credit}`
        : "";
    if (control) {
      control.hidden = images.length < 2;
      control.textContent = paused ? "スライドを再生" : "スライドを停止";
      control.setAttribute("aria-pressed", String(paused));
    }
  }
  function schedule() {
    clearInterval(timer);
    timer = null;
    if (!paused && !document.hidden && images.length > 1)
      timer = setInterval(() => {
        index = (index + 1) % images.length;
        display();
      }, 6000);
    display();
  }
  photos.forEach((photo, position) => {
    const image = photoImage(photo, {
      hero: true,
      first: position === 0,
      sizes: "100vw",
    });
    image.className = "hero-slide";
    const item = { image, photo };
    images.push(item);
    image.addEventListener(
      "error",
      () => {
        const at = images.indexOf(item);
        if (at < 0) return;
        images.splice(at, 1);
        image.remove();
        if (at < index) index--;
        schedule();
      },
      { once: true },
    );
    root.append(image);
  });
  control?.addEventListener("click", () => {
    paused = !paused;
    schedule();
  });
  motion.addEventListener("change", (event) => {
    paused = event.matches;
    schedule();
  });
  document.addEventListener("visibilitychange", schedule);
  schedule();
}
