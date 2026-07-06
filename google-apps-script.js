const SHEET_NAME = "RSVP";
const HEADERS = [
  "Имя",
  "Присутствие",
  "Трансфер",
  "Напитки",
  "Песня",
  "Отправлено на сайте",
];

function doGet() {
  return json({ ok: true, status: "RSVP endpoint is active" });
}

function doPost(e) {
  try {
    const sheet = getSheet();
    const answer = parseAnswer(e);

    prepareSheet(sheet);
    sheet.appendRow([
      cleanText(answer.name),
      formatYesNo(answer.attendance),
      formatYesNo(answer.transfer),
      Array.isArray(answer.alcohol) ? answer.alcohol.map(cleanText).filter(Boolean).join(", ") : cleanText(answer.alcohol),
      cleanText(answer.song),
      cleanText(answer.submittedAt),
    ]);

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function prepareSheet(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  const firstHeader = sheet.getRange(1, 1).getValue();

  if (firstHeader === "Дата получения") {
    sheet.deleteColumn(1);
  }

  if (firstHeader !== HEADERS[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function parseAnswer(e) {
  const parameters = e && e.parameter ? e.parameter : {};

  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  const rawBody = e && e.postData && e.postData.contents;

  if (rawBody) {
    try {
      return JSON.parse(rawBody);
    } catch (error) {
      const formBody = parseFormEncoded(rawBody);

      if (formBody.payload) {
        return JSON.parse(formBody.payload);
      }

      if (Object.keys(formBody).length > 0) {
        return formBody;
      }
    }
  }

  return parameters;
}

function parseFormEncoded(rawBody) {
  return rawBody.split("&").reduce((data, pair) => {
    const separatorIndex = pair.indexOf("=");
    const rawKey = separatorIndex >= 0 ? pair.slice(0, separatorIndex) : pair;
    const rawValue = separatorIndex >= 0 ? pair.slice(separatorIndex + 1) : "";

    if (!rawKey) {
      return data;
    }

    data[decodeFormValue(rawKey)] = decodeFormValue(rawValue);
    return data;
  }, {});
}

function decodeFormValue(value) {
  return decodeURIComponent(String(value).replace(/\+/g, " "));
}

function formatYesNo(value) {
  if (value === "yes") {
    return "Да";
  }

  if (value === "no") {
    return "Нет";
  }

  return cleanText(value);
}

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
