const DEFAULT_TELEGRAM_BOT_TOKEN = "7244155453:AAEdnet6p9Vc43TZoUEVtLVcMuANQHSmpvw";
const DEFAULT_TELEGRAM_CHAT_ID = "-1003934063475";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const jsonHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

const sendJson = (response, statusCode, body) => {
  Object.entries(jsonHeaders).forEach(([header, value]) => {
    response.setHeader(header, value);
  });

  response.statusCode = statusCode;
  response.end(JSON.stringify(body));
};

const readBody = async (request) => {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;

      if (rawBody.length > 50000) {
        reject(new Error("Payload is too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
};

const cleanText = (value, limit) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, limit);
};

const cleanChoice = (value) => {
  if (value === "yes" || value === "no") {
    return value;
  }

  return "";
};

const normalizeAnswer = (answer) => ({
  name: cleanText(answer?.name, 120),
  attendance: cleanChoice(answer?.attendance),
  transfer: cleanChoice(answer?.transfer),
  alcohol: Array.isArray(answer?.alcohol)
    ? answer.alcohol.map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 12)
    : [],
  song: cleanText(answer?.song, 250),
  submittedAt: cleanText(answer?.submittedAt, 80),
});

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
  const song = answer.song || "Не указано";
  const submittedAt = answer.submittedAt ? `\n🕒 Отправлено: ${answer.submittedAt}` : "";

  return [
    title,
    "",
    `👤 Имя: ${answer.name || "Не указано"}`,
    formatAttendance(answer.attendance),
    formatTransfer(answer.transfer),
    `🥂 Напитки:\n${alcohol}`,
    `🎵 Песня: ${song}${submittedAt}`,
  ].join("\n");
};

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return sendJson(response, 204, {});
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return sendJson(response, 500, { ok: false, error: "Telegram is not configured" });
    }

    const answer = normalizeAnswer(await readBody(request));

    if (!answer.name || !answer.attendance || !answer.transfer) {
      return sendJson(response, 400, { ok: false, error: "Required fields are missing" });
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatTelegramMessage(answer),
      }),
    });
    const telegramResult = await telegramResponse.json().catch(() => ({}));

    if (!telegramResponse.ok || !telegramResult.ok) {
      return sendJson(response, 502, { ok: false, error: "Telegram request failed" });
    }

    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, 500, { ok: false, error: "RSVP request failed" });
  }
};
