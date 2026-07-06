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
const TELEGRAM_BOT_TOKEN = "7244155453:AAEdnet6p9Vc43TZoUEVtLVcMuANQHSmpvw";
const TELEGRAM_CHAT_ID = "-1003934063475";
const RSVP_API_ENDPOINTS = [
  "https://nastya-oleg-wedding.vercel.app/api/rsvp",
  "/api/rsvp",
];
const RSVP_REQUEST_TIMEOUT = 12000;
const READABLE_EMPTY_VALUE = "Не указано";
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

const formatReadableAttendance = (attendance) => {
  if (attendance === "yes") {
    return "Присутствие: Конечно, да!";
  }

  if (attendance === "no") {
    return "Присутствие: К сожалению, нет";
  }

  return `Присутствие: ${READABLE_EMPTY_VALUE}`;
};

const formatReadableTransfer = (transfer) => {
  if (transfer === "yes") {
    return "Трансфер: Да";
  }

  if (transfer === "no") {
    return "Трансфер: Нет";
  }

  return `Трансфер: ${READABLE_EMPTY_VALUE}`;
};

const formatReadableTelegramMessage = (answer) => {
  const alcohol = answer.alcohol.length > 0
    ? answer.alcohol.map((item) => `- ${item}`).join("\n")
    : READABLE_EMPTY_VALUE;
  const submittedAt = formatReadableSubmittedAt(answer.submittedAt);
  const lines = [
    answer.attendance === "no" ? "Новый ответ: гость не придет" : "Новая анкета гостя",
    "",
    `Имя и фамилия: ${answer.name || READABLE_EMPTY_VALUE}`,
    formatReadableAttendance(answer.attendance),
    formatReadableTransfer(answer.transfer),
    `Напитки:\n${alcohol}`,
    `Песня: ${answer.song?.trim() || READABLE_EMPTY_VALUE}`,
  ];

  if (submittedAt) {
    lines.push(`Отправлено: ${submittedAt}`);
  }

  return lines.join("\n");
};

const formatAttendance = (attendance) => {
  if (attendance === "yes") {
    return "✅ Присутствие: Конечно, да!";
  }

  if (attendance === "no") {
    return "❌ Присутствие: К сожалению, нет";
  }

  return "Присутствие: Не указано";
};

const formatTransfer = (transfer) => {
  if (transfer === "yes") {
    return "🚌 Трансфер: Да";
  }

  if (transfer === "no") {
    return "🚌 Трансфер: Нет";
  }

  return "🚌 Трансфер: Не указано";
};

const formatTelegramMessage = (answer) => {
  const title = answer.attendance === "no" ? "🔕 Новый отказ" : "🔔 Новое подтверждение!";
  const alcohol = answer.alcohol.length > 0
    ? answer.alcohol.map((item) => `• ${item}`).join("\n")
    : "Не указано";
  const song = answer.song?.trim() || "Не указано";

  return [
    title,
    "",
    `👤 Имя: ${answer.name || "Не указано"}`,
    formatAttendance(answer.attendance),
    formatTransfer(answer.transfer),
    `🥂 Напитки:\n${alcohol}`,
    `🎵 Песня: ${song}`,
  ].join("\n");
};

const isTelegramConfigured = () =>
  TELEGRAM_BOT_TOKEN &&
  TELEGRAM_BOT_TOKEN !== "ВСТАВЬ_НОВЫЙ_ТОКЕН_БОТА" &&
  TELEGRAM_CHAT_ID;

const postJson = async (url, payload) => {
  const controller = "AbortController" in window ? new AbortController() : null;
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
  let timeoutId = null;

  if (controller) {
    requestOptions.signal = controller.signal;
    timeoutId = window.setTimeout(() => controller.abort(), RSVP_REQUEST_TIMEOUT);
  }

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Request failed");
    }

    return result;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
};

const sendDirectTelegramMessage = (answer) => {
  if (!isTelegramConfigured()) {
    throw new Error("Telegram bot token is not configured");
  }

  return postJson(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: formatReadableTelegramMessage(answer),
  });
};

const sendRsvpAnswer = async (answer) => {
  let lastError = null;

  for (const endpoint of RSVP_API_ENDPOINTS) {
    try {
      return await postJson(endpoint, answer);
    } catch (error) {
      lastError = error;
    }
  }

  try {
    return await sendDirectTelegramMessage(answer);
  } catch (error) {
    throw lastError || error;
  }
};

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
      localStorage.setItem("wedding-rsvp-answer", JSON.stringify(answer));
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
