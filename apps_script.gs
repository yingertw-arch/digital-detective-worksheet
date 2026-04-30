/**
 * ══════════════════════════════════════════════════════════════════
 *  時光偵探學習單｜Google Apps Script 後端
 *  海山國小 第三節：數位素養與辨識
 * ══════════════════════════════════════════════════════════════════
 *
 *  【部署步驟】
 *  1. 開啟 Google 試算表 → 「擴充功能」→「Apps Script」
 *  2. 將此檔案全部內容貼上
 *  3. 點「部署」→「新增部署」→ 類型選「網頁應用程式」
 *  4. 設定：
 *       執行身份：我（老師帳號）
 *       存取權限：所有人（含匿名）
 *  5. 點「部署」，複製「網頁應用程式 URL」
 *  6. 將 URL 貼入學生版 HTML 的 SCRIPT_URL 常數，以及教師後台的輸入欄
 *
 *  【試算表欄位自動建立】
 *  首次有學生作答時，會自動在第一列建立欄位標題。
 * ══════════════════════════════════════════════════════════════════
 */

// ── 試算表工作表名稱（可自行修改）
var SHEET_NAME = "學生作答";

// ── 取得或建立工作表
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

// ── 建立標題列
var HEADERS = [
  "提交時間", "姓名", "班級", "座號", "日期", "總分",
  "Q1可疑截圖", "Q1理由",
  "Q2停", "Q3看", "Q4聽",
  "Q5AI破綻(多選)", "圖①觀察", "圖②觀察",
  "J1路標", "J2手指", "J3建築", "J4臉清晰",
  "Q6連結體驗",
  "Q7確認清單(勾選)", "Q8照片處理(多選)",
  "Q9感受", "Q9感受理由",
  "Q10完成句子"
];

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    // 格式化標題列
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#1a1a2e");
    headerRange.setFontColor("#f5e6a3");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
  }
}

// ══════════════════════════════
//  doPost：接收學生作答資料
// ══════════════════════════════
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet();
    ensureHeaders(sheet);

    var row = [
      new Date().toLocaleString("zh-TW"),
      data.name        || "",
      data.class_name  || "",
      data.seat        || "",
      data.date        || "",
      data.score       || 0,
      data.q1_action   || "",
      data.q1_reason   || "",
      data.q1_stop     || "",
      data.q1_look     || "",
      data.q1_listen   || "",
      data.q2_flaws    || "",
      data.q1_obs1     || "",
      data.q1_obs2     || "",
      data.j1          || "",
      data.j2          || "",
      data.j3          || "",
      data.j4          || "",
      data.q2_connect  || "",
      data.q3_check    || "",
      data.q3_photo    || "",
      data.q3_feel     || "",
      data.q3_feel_reason || "",
      data.q3_complete || ""
    ];

    sheet.appendRow(row);

    // 根據分數自動標色
    var lastRow = sheet.getLastRow();
    var scoreCell = sheet.getRange(lastRow, 6); // 第6欄是分數
    var score = parseInt(data.score) || 0;
    if (score >= 18) {
      scoreCell.setBackground("#e8f5e9"); // 綠
    } else if (score >= 14) {
      scoreCell.setBackground("#fff3e0"); // 橙
    } else {
      scoreCell.setBackground("#fdecea"); // 紅
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", score: score }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ══════════════════════════════
//  doGet：供教師後台讀取所有資料
// ══════════════════════════════
function doGet(e) {
  try {
    var sheet = getSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      // 只有標題或空的
      return ContentService
        .createTextOutput(JSON.stringify([HEADERS]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ══════════════════════════════
//  輔助：手動觸發（測試用）
// ══════════════════════════════
function testSheet() {
  var sheet = getSheet();
  ensureHeaders(sheet);
  Logger.log("工作表名稱：" + sheet.getName());
  Logger.log("目前列數：" + sheet.getLastRow());
}
