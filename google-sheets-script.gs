
/**
 * SISTEM OPR DIGITAL - BACKEND SCRIPT (STRUCTURED VERSION)
 * Memecahkan data kepada kolum supaya mudah diedit di Google Sheets.
 */

const SHEET_NAME = "Reports";

// Definisi Kolum (Urutan sangat penting)
const COL = {
  ID: 0,
  PROGRAM: 1,
  DATE: 2,
  TIME: 3,
  VENUE: 4,
  CATEGORY: 5,
  TARGET: 6,
  OBJECTIVES: 7,
  IMPACT: 8,
  REPORTER: 9,
  POSITION: 10,
  IMAGES_JSON: 11,
  CREATED_AT: 12
};

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  // Menambah "Masa" di antara Tarikh dan Lokasi
  const headers = ["ID", "Program", "Tarikh", "Masa", "Lokasi", "Kategori", "Sasaran", "Objektif (JSON)", "Impak", "Pelapor", "Jawatan", "Gambar (JSON)", "CreatedAt"];
  
  if (sheet) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
  }
  return "Setup Berjaya! Kolum Masa telah ditambah.";
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || setup_internal();
  
  if (action === "read") {
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return createJsonResponse([]);
    
    data.shift(); // Buang header
    const result = data.map(row => {
      return {
        id: row[COL.ID],
        programName: row[COL.PROGRAM],
        date: row[COL.DATE],
        time: row[COL.TIME],
        venue: row[COL.VENUE],
        category: row[COL.CATEGORY],
        targetGroup: row[COL.TARGET],
        objectives: tryParse(row[COL.OBJECTIVES], []),
        impact: row[COL.IMPACT],
        reporterName: row[COL.REPORTER],
        reporterPosition: row[COL.POSITION],
        images: tryParse(row[COL.IMAGES_JSON], []),
        createdAt: new Date(row[COL.CREATED_AT]).getTime()
      };
    }).filter(item => item.id);
    
    return createJsonResponse(result);
  }
  return createJsonResponse({ error: "Action tidak sah" });
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || setup_internal();
    
    if (action === "upsert") {
      const d = postData.data;
      const dataRows = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      // Cari ID sedia ada (Skip header)
      for (let i = 1; i < dataRows.length; i++) {
        if (String(dataRows[i][COL.ID]) === String(d.id)) {
          rowIndex = i + 1;
          break;
        }
      }
      
      const newRow = [];
      newRow[COL.ID] = d.id;
      newRow[COL.PROGRAM] = d.programName;
      newRow[COL.DATE] = d.date;
      newRow[COL.TIME] = d.time || "";
      newRow[COL.VENUE] = d.venue;
      newRow[COL.CATEGORY] = d.category;
      newRow[COL.TARGET] = d.targetGroup;
      newRow[COL.OBJECTIVES] = JSON.stringify(d.objectives);
      newRow[COL.IMPACT] = d.impact;
      newRow[COL.REPORTER] = d.reporterName;
      newRow[COL.POSITION] = d.reporterPosition;
      newRow[COL.IMAGES_JSON] = JSON.stringify(d.images);
      newRow[COL.CREATED_AT] = d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString();
      
      if (rowIndex !== -1) {
        // UPDATE sedia ada
        sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
      } else {
        // INSERT baru
        sheet.appendRow(newRow);
      }
      return createJsonResponse({ status: "success", mode: rowIndex !== -1 ? "updated" : "created" });
    }
    
    if (action === "delete") {
      const id = postData.id;
      const dataRows = sheet.getDataRange().getValues();
      for (let i = 1; i < dataRows.length; i++) {
        if (String(dataRows[i][COL.ID]) === String(id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return createJsonResponse({ status: "deleted" });
    }
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

function tryParse(str, fallback) {
  if (!str) return fallback;
  try { return JSON.parse(str); } 
  catch (e) { return fallback; }
}

function setup_internal() {
  setup();
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
