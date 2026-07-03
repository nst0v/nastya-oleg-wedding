const musicButton = document.querySelector(".music-btn");
const audio = document.querySelector("#bg-music");
const letterIntro = document.querySelector(".letter-intro");
const letterButton = document.querySelector(".letter-button");
const topMarquee = document.querySelector(".marquee--top");

document.documentElement.classList.add("motion-ready");
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

document.querySelectorAll("main > section:not(.hero):not(.letter-intro) > *, main > .marquee:not(.marquee--top)").forEach((element) => {
  element.classList.add("reveal-soft");
});

letterButton?.addEventListener("click", () => {
  if (!letterIntro || letterIntro.classList.contains("is-open")) {
    return;
  }

  letterIntro.classList.add("is-open");
  document.body.classList.remove("has-letter");
  window.scrollTo(0, 0);
  window.setTimeout(() => {
    topMarquee?.classList.add("is-visible");
  }, 3200);
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
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal-soft").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal-soft").forEach((element) => element.classList.add("is-visible"));
}

musicButton?.addEventListener("click", async () => {
  if (!audio) return;

  try {
    if (audio.paused) {
      await audio.play();
      musicButton.classList.add("is-playing");
      musicButton.setAttribute("aria-pressed", "true");
      musicButton.innerHTML = "ВЫКЛ.<br>МУЗЫКУ";
    } else {
      audio.pause();
      musicButton.classList.remove("is-playing");
      musicButton.setAttribute("aria-pressed", "false");
      musicButton.innerHTML = "ВКЛЮЧИТЬ<br>МУЗЫКУ";
    }
  } catch (error) {
    musicButton.classList.toggle("is-playing");
  }
});

const rsvpForm = document.querySelector(".rsvp-form");
const formNote = document.querySelector(".form-note");
const multiSelects = document.querySelectorAll("[data-multi-select]");
const TELEGRAM_BOT_TOKEN = "7244155453:AAEdnet6p9Vc43TZoUEVtLVcMuANQHSmpvw";
const TELEGRAM_CHAT_ID = "-1003934063475";

const closeMultiSelect = (multiSelect) => {
  const button = multiSelect.querySelector(".multi-select__button");

  multiSelect.classList.remove("is-open");
  button?.setAttribute("aria-expanded", "false");
};

const updateMultiSelectValue = (multiSelect) => {
  const value = multiSelect.querySelector("[data-multi-select-value]");
  const selectedOptions = Array.from(multiSelect.querySelectorAll('input[type="checkbox"]:checked'));

  if (!value) {
    return;
  }

  if (selectedOptions.length === 0) {
    value.textContent = "Можно выбрать несколько вариантов";
    return;
  }

  if (selectedOptions.length === 1) {
    value.textContent = selectedOptions[0].value;
    return;
  }

  value.textContent = `Выбрано: ${selectedOptions.length}`;
};

multiSelects.forEach((multiSelect) => {
  const button = multiSelect.querySelector(".multi-select__button");
  const checkboxes = multiSelect.querySelectorAll('input[type="checkbox"]');

  button?.addEventListener("click", () => {
    const isOpen = multiSelect.classList.contains("is-open");

    multiSelects.forEach(closeMultiSelect);
    multiSelect.classList.toggle("is-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => updateMultiSelectValue(multiSelect));
  });

  updateMultiSelectValue(multiSelect);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-multi-select]")) {
    multiSelects.forEach(closeMultiSelect);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    multiSelects.forEach(closeMultiSelect);
  }
});

const formatAttendance = (attendance) => {
  if (attendance === "yes") {
    return "✅ Присутствие: Да, буду присутствовать";
  }

  if (attendance === "no") {
    return "❌ Присутствие: Нет, не смогу присутствовать";
  }

  return "Присутствие: Не указано";
};

const formatTelegramMessage = (answer) => {
  const title = answer.attendance === "no" ? "🔕 Новый отказ" : "🔔 Новое подтверждение!";
  const alcohol = answer.alcohol.length > 0
    ? answer.alcohol.map((item) => `• ${item}`).join("\n")
    : "Не указано";
  const additionalInfo = answer.additionalInfo?.trim() || "Не указано";

  return [
    title,
    "",
    `👤 Имя: ${answer.name || "Не указано"}`,
    formatAttendance(answer.attendance),
    `🥂 Алкоголь:\n${alcohol}`,
    `📝 Дополнительная информация: ${additionalInfo}`,
  ].join("\n");
};

const isTelegramConfigured = () =>
  TELEGRAM_BOT_TOKEN &&
  TELEGRAM_BOT_TOKEN !== "ВСТАВЬ_НОВЫЙ_ТОКЕН_БОТА" &&
  TELEGRAM_CHAT_ID;

const showRsvpSuccess = () => {
  rsvpForm.classList.add("is-submitted");
  rsvpForm.querySelector(".rsvp-form__fields")?.setAttribute("aria-hidden", "true");
  rsvpForm.querySelector(".rsvp-success")?.setAttribute("aria-hidden", "false");
  rsvpForm.querySelectorAll("input, textarea, button").forEach((control) => {
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
      additionalInfo: formData.get("additional_info"),
      alcohol: formData.getAll("alcohol"),
      submittedAt: new Date().toISOString(),
    };

    formNote.textContent = "Отправляем ответ...";
    if (submitButton) {
      submitButton.textContent = "Отправляем...";
    }
    submitButton?.setAttribute("disabled", "disabled");

    try {
      if (!isTelegramConfigured()) {
        throw new Error("Telegram bot token is not configured");
      }

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: formatTelegramMessage(answer),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error("Request failed");
      }

      localStorage.setItem("wedding-rsvp-answer", JSON.stringify(answer));
      formNote.textContent = "";
      multiSelects.forEach((multiSelect) => {
        closeMultiSelect(multiSelect);
        updateMultiSelectValue(multiSelect);
      });
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
