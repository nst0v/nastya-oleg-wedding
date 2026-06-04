const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const hero = document.querySelector(".hero");
const countdownParts = {
  days: document.querySelector('[data-countdown="days"]'),
  hours: document.querySelector('[data-countdown="hours"]'),
  minutes: document.querySelector('[data-countdown="minutes"]'),
  seconds: document.querySelector('[data-countdown="seconds"]'),
};

const formatTimePart = (value) => String(Math.max(0, value)).padStart(2, "0");

const updateCountdown = () => {
  if (
    !hero ||
    !countdownParts.days ||
    !countdownParts.hours ||
    !countdownParts.minutes ||
    !countdownParts.seconds
  ) {
    return;
  }

  const targetDate = new Date(hero.dataset.weddingDate);
  const difference = targetDate.getTime() - Date.now();
  const totalSeconds = Math.max(0, Math.floor(difference / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownParts.days.textContent = formatTimePart(days);
  countdownParts.hours.textContent = formatTimePart(hours);
  countdownParts.minutes.textContent = formatTimePart(minutes);
  countdownParts.seconds.textContent = formatTimePart(seconds);
};

updateCountdown();
window.setInterval(updateCountdown, 1000);

const navLinks = document.querySelectorAll(".quick-nav a");
const navSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && navSections.length > 0) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      threshold: 0.34,
      rootMargin: "-18% 0px -54% 0px",
    }
  );

  navSections.forEach((section) => navObserver.observe(section));
}

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

  value.textContent =
    selectedOptions.length <= 2
      ? selectedOptions.map((option) => option.value).join(", ")
      : `Выбрано вариантов: ${selectedOptions.length}`;
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
      formNote.textContent = "Ваш ответ уже пришел нам, спасибо!";
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
