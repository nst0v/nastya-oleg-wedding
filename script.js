const musicButton = document.querySelector(".music-btn");
const audio = document.querySelector("#bg-music");
const letterIntro = document.querySelector(".letter-intro");
const letterButton = document.querySelector(".letter-button");

document.documentElement.classList.add("motion-ready");
document.documentElement.classList.toggle("has-letter", Boolean(letterIntro));
document.body.classList.toggle("has-letter", Boolean(letterIntro));

const splitTextToLetters = (element, delayStart = 0, delayStep = 34) => {
  let index = 0;

  const walk = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.matches("em")) {
      node.classList.add("char", "char--word");
      node.style.setProperty("--char-delay", `${delayStart + index * delayStep}ms`);
      index += Math.max((node.textContent || "").length, 1);
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();

      node.textContent.split("").forEach((char) => {
        const span = document.createElement("span");
        span.className = char.trim() ? "char" : "char char--space";
        span.style.setProperty("--char-delay", `${delayStart + index * delayStep}ms`);
        span.innerHTML = char === " " ? "&nbsp;" : char;
        fragment.appendChild(span);
        index += 1;
      });

      node.replaceWith(fragment);
      return;
    }

    Array.from(node.childNodes).forEach(walk);
  };

  walk(element);
  return delayStart + index * delayStep;
};

let heroDelay = 120;
document.querySelectorAll(".couple, .hero h1 .hero-line, .hero h1 > span:not(.hero-line)").forEach((element) => {
  heroDelay = splitTextToLetters(element, heroDelay, 32) + 70;
});

document.querySelectorAll(
  "main > section:not(.hero):not(.letter-intro) > *:not(.rsvp-form), main > .marquee:not(.marquee--top), .rsvp-form__fields > *"
).forEach((element) => {
  element.classList.add("reveal-soft");
});

letterButton?.addEventListener("click", () => {
  if (!letterIntro || letterIntro.classList.contains("is-open")) {
    return;
  }

  letterIntro.classList.add("is-open");
  document.documentElement.classList.remove("has-letter");
  document.body.classList.remove("has-letter");
  window.scrollTo(0, 0);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.01, rootMargin: "0px 0px 24% 0px" }
  );

  document.querySelectorAll(".reveal-soft").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal-soft").forEach((element) => element.classList.add("is-visible"));
}

const styleGallery = document.querySelector("#style-gallery");
const styleGalleryPage = styleGallery?.querySelector(".style-gallery__page");
const styleGalleryTitle = styleGallery?.querySelector("#style-gallery-title");
const styleGalleryGrid = styleGallery?.querySelector("[data-style-gallery-grid]");
const styleGalleryClose = styleGallery?.querySelector(".style-gallery__close");
const styleGalleryTriggers = document.querySelectorAll("[data-style-gallery]");
const styleGalleryConfig = {
  women: { folder: "woman", count: 30 },
  men: { folder: "man", count: 28 },
};
let activeStyleGalleryTrigger = null;
let zoomedStyleGalleryImage = null;

const closeStyleGalleryZoom = () => {
  zoomedStyleGalleryImage?.classList.remove("is-zoomed");
  zoomedStyleGalleryImage = null;
};

const renderStyleGallery = (type, title) => {
  const config = styleGalleryConfig[type];

  if (!config || !styleGalleryGrid) {
    return;
  }

  closeStyleGalleryZoom();

  const images = Array.from({ length: config.count }, (_, index) => {
    const image = document.createElement("img");
    image.src = `img/blossom/${config.folder}/${index + 1}.jpg`;
    image.alt = `${title} ${index + 1}`;
    image.width = 600;
    image.height = 600;
    image.decoding = "async";
    image.loading = index < 9 ? "eager" : "lazy";
    return image;
  });

  styleGalleryGrid.replaceChildren(...images);
};

const openStyleGallery = (trigger) => {
  if (!styleGallery || !styleGalleryTitle) {
    return;
  }

  const type = trigger.dataset.styleGallery;
  const title = trigger.textContent.trim();

  activeStyleGalleryTrigger = trigger;
  styleGalleryTitle.textContent = title;
  renderStyleGallery(type, title);
  styleGallery.classList.add("is-open");
  styleGallery.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");
  styleGalleryTriggers.forEach((button) => button.setAttribute("aria-expanded", String(button === trigger)));
  styleGalleryPage?.focus({ preventScroll: true });
};

const closeStyleGallery = () => {
  if (!styleGallery?.classList.contains("is-open")) {
    return;
  }

  closeStyleGalleryZoom();
  styleGallery.classList.remove("is-open");
  styleGallery.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-open");
  styleGalleryTriggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
  activeStyleGalleryTrigger?.focus({ preventScroll: true });
  activeStyleGalleryTrigger = null;
};

styleGalleryTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openStyleGallery(trigger));
});

styleGalleryGrid?.addEventListener("click", (event) => {
  const image = event.target.closest("img");

  if (!image || !styleGalleryGrid.contains(image)) {
    return;
  }

  if (image === zoomedStyleGalleryImage) {
    closeStyleGalleryZoom();
    return;
  }

  closeStyleGalleryZoom();
  image.classList.add("is-zoomed");
  zoomedStyleGalleryImage = image;
});

styleGalleryClose?.addEventListener("click", closeStyleGallery);

styleGallery?.addEventListener("click", (event) => {
  if (event.target === styleGallery) {
    closeStyleGallery();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (zoomedStyleGalleryImage) {
      closeStyleGalleryZoom();
      return;
    }

    closeStyleGallery();
  }
});

musicButton?.addEventListener("click", async () => {
  if (!audio) return;

  try {
    if (audio.paused) {
      await audio.play();
      musicButton.classList.add("is-playing");
      musicButton.setAttribute("aria-pressed", "true");
      musicButton.setAttribute("aria-label", "Остановить мелодию нашей любви");
    } else {
      audio.pause();
      musicButton.classList.remove("is-playing");
      musicButton.setAttribute("aria-pressed", "false");
      musicButton.setAttribute("aria-label", "Включите мелодию нашей любви");
    }
  } catch (error) {
    musicButton.classList.toggle("is-playing");
  }
});

const rsvpForm = document.querySelector(".rsvp-form");
const formNote = document.querySelector(".form-note");
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzD3GGT68gdbmWixYG8Gyf8lKisPIY7TTzumF5iYQiYUYuXPS5sBh6IfoQ1sPnhjr1baQ/exec";
const READABLE_SUBMITTED_AT_PATTERN = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/;

const formatReadableSubmittedAt = (submittedAt) => {
  if (!submittedAt) {
    return "";
  }

  if (READABLE_SUBMITTED_AT_PATTERN.test(submittedAt)) {
    return submittedAt;
  }

  const date = new Date(submittedAt);

  if (Number.isNaN(date.getTime())) {
    return submittedAt;
  }

  const parts = new Intl.DateTimeFormat("ru-RU-u-nu-latn", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${valueByType.day}.${valueByType.month}.${valueByType.year} ${valueByType.hour}:${valueByType.minute}`;
};

const getRsvpBody = (answer) => {
  const body = new URLSearchParams();

  body.set("payload", JSON.stringify(answer));
  body.set("name", answer.name || "");
  body.set("attendance", answer.attendance || "");
  body.set("transfer", answer.transfer || "");
  body.set("alcohol", answer.alcohol.join(", "));
  body.set("song", answer.song || "");
  body.set("submittedAt", answer.submittedAt || "");
  body.set("requestId", `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  return body;
};

const postGoogleSheet = (answer) => {
  const body = getRsvpBody(answer);

  if ("sendBeacon" in navigator && navigator.sendBeacon(GOOGLE_SHEETS_WEB_APP_URL, body)) {
    return { ok: true };
  }

  fetch(GOOGLE_SHEETS_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    body,
  });

  return { ok: true };
};

const sendRsvpAnswer = (answer) => postGoogleSheet(answer);

const showRsvpSuccess = () => {
  rsvpForm.classList.add("is-submitted");
  rsvpForm.querySelector(".rsvp-form__fields")?.setAttribute("aria-hidden", "true");
  rsvpForm.querySelector(".rsvp-success")?.setAttribute("aria-hidden", "false");
  rsvpForm.querySelectorAll("input, button").forEach((control) => {
    control.setAttribute("disabled", "disabled");
  });
};

if (rsvpForm && formNote) {
  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (rsvpForm.classList.contains("is-submitted")) {
      return;
    }

    const formData = new FormData(rsvpForm);
    const submitButton = rsvpForm.querySelector('button[type="submit"]');
    const submitButtonText = submitButton?.textContent;
    const answer = {
      name: formData.get("name"),
      attendance: formData.get("attendance"),
      transfer: formData.get("transfer"),
      alcohol: formData.getAll("alcohol"),
      song: formData.get("song"),
      submittedAt: formatReadableSubmittedAt(new Date().toISOString()),
    };

    formNote.textContent = "Отправляем ответ...";
    if (submitButton) {
      submitButton.textContent = "Отправляем...";
    }
    submitButton?.setAttribute("disabled", "disabled");

    try {
      await sendRsvpAnswer(answer);
      formNote.textContent = "";
      showRsvpSuccess();
    } catch (error) {
      formNote.textContent = "Не получилось отправить ответ. Попробуйте еще раз чуть позже.";
      alert("Не получилось отправить ответ. Попробуйте еще раз чуть позже.");
    } finally {
      if (!rsvpForm.classList.contains("is-submitted")) {
        if (submitButton && submitButtonText) {
          submitButton.textContent = submitButtonText;
        }
        submitButton?.removeAttribute("disabled");
      }
    }
  });
}

const paletteCards = document.querySelectorAll(".palette-collection img");

const togglePaletteCard = (card) => {
  const isOpen = card.classList.contains("is-open");
  paletteCards.forEach((item) => item.classList.remove("is-open"));
  if (!isOpen) card.classList.add("is-open");
};

paletteCards.forEach((card) => {
  card.addEventListener("click", () => togglePaletteCard(card));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    togglePaletteCard(card);
  });
});
