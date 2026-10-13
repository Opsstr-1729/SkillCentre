/**
 * Google Apps Script for Centre Infrastructure & Facility Data Collection
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your target Google Sheet.
 * 2. Click on 'Extensions' > 'Apps Script' in the top menu.
 * 3. Delete any default code in Code.gs and paste the code below.
 * 4. Click 'Deploy' > 'New deployment'.
 * 5. Select type: 'Web app'.
 * 6. Set Description: "Infrastructure Portal Submission Webhook".
 * 7. Set 'Execute as': "Me" (your Google account).
 * 8. Set 'Who has access': "Anyone" (allows the backend server to post submissions).
 * 9. Click 'Deploy' and copy the resulting Web App URL.
 * 10. Paste the URL into your server environment: GOOGLE_APPS_SCRIPT_URL="<your_url>" in .env
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent requests
  lock.tryLock(30000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("Submissions") || doc.getActiveSheet();

    // If the sheet is empty, automatically create and format the header row
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Submission Timestamp",
        "Submission ID",
        "Department",
        "Centre / Institution Name",
        "District / Location",
        "Classrooms",
        "Computers",
        "Total Area (sq. ft.)",
        "Official Address",
        "Contact Phone",
        "Official Email"
      ];
      sheet.appendRow(headers);

      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0e5774");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Parse the incoming JSON submission
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.submittedAt 
      ? Utilities.formatDate(new Date(data.submittedAt), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss")
      : Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    var row = [
      timestamp,
      data.id || ("SUB-" + new Date().getTime()),
      data.department || "",
      data.centreName || "",
      data.district || "",
      Number(data.classrooms || 0),
      Number(data.computers || 0),
      Number(data.totalAreaSqFt || 0),
      data.address || "",
      data.phone || "",
      data.email || ""
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Submission appended to Google Sheet successfully",
      id: data.id
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Centre Infrastructure Google Apps Script Webhook is active"
  })).setMimeType(ContentService.MimeType.JSON);
}
