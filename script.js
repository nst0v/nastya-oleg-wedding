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

if (rsvpForm && formNote) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(rsvpForm);
    const answer = {
      name: formData.get("name"),
      attendance: formData.get("attendance"),
      guests: formData.get("guests"),
      song: formData.get("song"),
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("wedding-rsvp-answer", JSON.stringify(answer));
    formNote.textContent = "Спасибо, ответ сохранен.";
    rsvpForm.reset();
  });
}
