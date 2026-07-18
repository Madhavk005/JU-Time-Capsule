/**
 * JECRC Time Capsule 2026 - Google Apps Script Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code in Code.gs and paste this entire script.
 * 4. Create a folder in Google Drive named "JECRC Time Capsule Media" and get its ID if you want, 
 *    or the script will automatically create it in the root of your Google Drive.
 * 5. Run the `setupSheet` function once to automatically create the styled headers.
 * 6. Run the `setupTrigger` function once to schedule the automatic unlock email checks daily.
 * 7. Deploy as a Web App:
 *    - Click "Deploy" > "New deployment".
 *    - Select "Web app" as the type.
 *    - Under "Execute as", select "Me" (your account).
 *    - Under "Who has access", select "Anyone". (This is critical for the Next.js frontend to post data).
 *    - Click "Deploy", authorize the permissions, and copy the Web App URL.
 *    - Paste the URL in your Next.js project's `.env` file as `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`.
 */

// --- CONFIGURATION ---
var MEDIA_FOLDER_NAME = "JECRC Time Capsule Media";

/**
 * Handles incoming POST requests from the Next.js form.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    setupSheetIfNeeded(sheet);
    
    // --- DUPLICATE CHECK ---
    var values = sheet.getDataRange().getValues();
    var enrollmentColIndex = 2; // Column C (0-based: 2)
    var emailColIndex = 3;      // Column D (0-based: 3)
    
    var inputEnrollment = (data.enrollmentNumber || "").toString().toUpperCase().trim();
    var inputEmail = (data.jecrcEmail || "").toString().toLowerCase().trim();
    
    for (var i = 1; i < values.length; i++) {
      var existingEnrollment = values[i][enrollmentColIndex].toString().toUpperCase().trim();
      var existingEmail = values[i][emailColIndex].toString().toLowerCase().trim();
      
      if (inputEnrollment !== "" && existingEnrollment === inputEnrollment) {
        return createResponse("error", "This Registration Number has already sealed a time capsule.");
      }
      if (inputEmail !== "" && existingEmail === inputEmail) {
        return createResponse("error", "This JECRC Email has already sealed a time capsule.");
      }
    }
    
    // --- FILE UPLOAD TO GOOGLE DRIVE ---
    var fileUrl = "";
    if (data.fileData && data.fileMimeType && data.fileName) {
      var folder;
      var folders = DriveApp.getFoldersByName(MEDIA_FOLDER_NAME);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(MEDIA_FOLDER_NAME);
      }
      
      var decoded = Utilities.base64Decode(data.fileData);
      var blob = Utilities.newBlob(decoded, data.fileMimeType, data.fileName);
      var file = folder.createFile(blob);
      
      // Set sharing so anyone with link can view
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }
    
    // --- APPEND DATA ---
    var newRow = [
      new Date(),                     // Timestamp
      data.fullName || "",            // Full Name
      inputEnrollment,                // Registration Number
      inputEmail,                     // JECRC Email ID
      (data.personalEmail || "").toString().trim(), // Personal Email ID
      data.mobileNumber || "",        // Mobile Number
      data.school || "",              // School
      data.program || "",             // Course
      data.graduationYear || "",      // Graduation Year
      data.dream || "",               // One Dream
      data.fear || "",                // One Fear
      data.promise || "",             // One Promise
      fileUrl,                        // Media File URL
      "No",                           // Email Sent Status
      ""                              // Email Sent Date
    ];
    
    sheet.appendRow(newRow);
    

    
    return createResponse("success", "Time capsule successfully sealed!");
    
  } catch (error) {
    return createResponse("error", "Server Error: " + error.toString());
  }
}

/**
 * Creates a JSON response for the web app.
 */
function createResponse(status, message) {
  var output = JSON.stringify({ status: status, message: message });
  return ContentService.createTextOutput(output)
                       .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Auto-creates and styles headers if the sheet is completely blank.
 */
function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  setupSheetIfNeeded(sheet);
}

function setupSheetIfNeeded(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Full Name",
      "Registration Number",
      "JECRC Email ID",
      "Personal Email ID",
      "Mobile Number",
      "School",
      "Course",
      "Graduation Year",
      "One Dream",
      "One Fear",
      "One Promise",
      "Media File URL",
      "Email Sent",
      "Email Sent Date"
    ];
    sheet.appendRow(headers);
    
    // Premium theme styling (JECRC Red & Bold White)
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold")
               .setBackground("#CD201F")
               .setFontColor("#FFFFFF")
               .setFontFamily("Montserrat")
               .setHorizontalAlignment("center")
               .setVerticalAlignment("middle");
    
    sheet.setRowHeight(1, 35);
    sheet.getRange(1, 1, 1, headers.length).setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  }
}

function getFirstSaturdayOfJanuary(year) {
  var yearVal = parseInt(year);
  if (isNaN(yearVal)) {
    yearVal = new Date().getFullYear();
  }
  for (var d = 1; d <= 7; d++) {
    var date = new Date(yearVal, 0, d);
    if (date.getDay() === 6) { // 6 = Saturday
      return date;
    }
  }
  return new Date(yearVal, 0, 1); // fallback
}


/**
 * Set up daily time-based trigger for unlocking checking.
 */
function setupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "checkAndSendUnlockMails") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Triggers daily check in the morning
  ScriptApp.newTrigger("checkAndSendUnlockMails")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
    
  Logger.log("Daily trigger scheduled successfully!");
}

/**
 * Scans the sheet and sends unlock emails to users whose target date has arrived.
 */
function checkAndSendUnlockMails() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var values = sheet.getDataRange().getValues();
  var today = new Date();
  
  var todayYear = today.getFullYear();
  var todayMonth = today.getMonth();
  var todayDate = today.getDate();
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var fullName = row[1];
    var jecrcEmail = row[3];
    var personalEmail = row[4];
    var gradYear = parseInt(row[8]);
    var dream = row[9];
    var fear = row[10];
    var promise = row[11];
    var mediaUrl = row[12];
    var emailSent = row[13];
    
    if (!gradYear || isNaN(gradYear)) continue;
    
    // Skip if already unlocked/sent
    if (emailSent) {
      var sentStr = emailSent.toString().trim().toLowerCase();
      if (sentStr === "yes" || sentStr === "true") continue;
    }
    
    // Target Unlock Date = 1st Saturday of January of (Graduation Year + 1)
    var targetYear = gradYear + 1;
    var targetDate = getFirstSaturdayOfJanuary(targetYear);
    
    if (!targetDate) continue;
    
    var targetYearValue = targetDate.getFullYear();
    var targetMonthValue = targetDate.getMonth(); // 0 (January)
    var targetDateValue = targetDate.getDate();
    
    // Timezone-safe comparison (checks if today is on or after the targetDate calendar-wise)
    var shouldUnlock = false;
    if (todayYear > targetYearValue) {
      shouldUnlock = true;
    } else if (todayYear === targetYearValue) {
      if (todayMonth > targetMonthValue) {
        shouldUnlock = true;
      } else if (todayMonth === targetMonthValue) {
        if (todayDate >= targetDateValue) {
          shouldUnlock = true;
        }
      }
    }
    
    if (shouldUnlock) {
      var success = sendUnlockEmail(fullName, jecrcEmail, personalEmail, gradYear, dream, fear, promise, mediaUrl);
      if (success) {
        var rowNum = i + 1; // 1-based index
        sheet.getRange(rowNum, 14).setValue("Yes");
        sheet.getRange(rowNum, 15).setValue(new Date());
      }
    }
  }
}

/**
 * Helper to extract Drive File ID and build an embeddable/previewable image URL.
 */
function getEmbedUrlFromDriveUrl(driveUrl) {
  if (!driveUrl) return "";
  var fileId = "";
  var matches = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || driveUrl.match(/id=([a-zA-Z0-9_-]+)/);
  if (matches && matches[1]) {
    fileId = matches[1];
  }
  if (fileId) {
    return "https://drive.google.com/thumbnail?sz=w800&id=" + fileId;
  }
  return driveUrl;
}



/**
 * Sends the unlock email containing the secrets.
 */
function sendUnlockEmail(fullName, jecrcEmail, personalEmail, gradYear, dream, fear, promise, mediaUrl) {
  var subject = "🔓 JECRC University Time Capsule Unlocked: Welcome to the Future!";
  var htmlBody = getUnlockEmailHtml(fullName, gradYear, dream, fear, promise, mediaUrl);
  
  var recipients = [];
  if (jecrcEmail && jecrcEmail.trim() !== "") {
    recipients.push(jecrcEmail.trim());
  }
  if (personalEmail && personalEmail.trim() !== "" && personalEmail.toLowerCase() !== jecrcEmail.toLowerCase()) {
    recipients.push(personalEmail.trim());
  }
  
  if (recipients.length === 0) return false;
  
  try {
    GmailApp.sendEmail(recipients.join(","), subject, "", {
      htmlBody: htmlBody,
      name: "JECRC University Time Capsule"
    });
    return true;
  } catch (err) {
    Logger.log("Error sending unlock email to " + recipients.join(",") + ": " + err.toString());
    return false;
  }
}

// --- HTML EMAIL TEMPLATES ---



function getUnlockEmailHtml(fullName, gradYear, dream, fear, promise, mediaUrl) {
  var mediaEmbedHtml = '';
  var mediaButtonHtml = '';
  if (mediaUrl && mediaUrl !== "") {
    var embedUrl = getEmbedUrlFromDriveUrl(mediaUrl);
    mediaEmbedHtml = 
      '      <div style="margin: 25px 0; text-align: center;">' +
      '        <div style="display: inline-block; padding: 10px; background-color: #F9F8F6; border: 1px solid #E4E4E7; border-radius: 20px;">' +
      '          <img src="' + embedUrl + '" alt="Sealed Memory" style="max-width: 100%; max-height: 400px; border-radius: 12px; display: block; margin: 0 auto;" />' +
      '        </div>' +
      '      </div>';
    
    mediaButtonHtml = 
      '      <div style="text-align: center; margin: 20px 0 25px 0;">' +
      '        <a href="' + mediaUrl + '" target="_blank" style="background-color: #CD201F; color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 15px 30px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(205, 32, 31, 0.15); font-family: Helvetica, Arial, sans-serif; letter-spacing: 0.5px;">' +
      '          📷 VIEW ON GOOGLE DRIVE' +
      '        </a>' +
      '      </div>';
  }
  
  return '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '  <meta charset="utf-8">' +
    '  <style>' +
    '    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #F9F8F6; color: #1A1A1A; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }' +
    '    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #E4E4E7; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02); }' +
    '    .header { background-color: #1A1A1A; padding: 40px; text-align: center; border-bottom: 4px solid #CD201F; }' +
    '    .header h1 { color: #FFFFFF; font-family: "Georgia", serif; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 1px; }' +
    '    .header p { color: #A1A1AA; font-size: 12px; margin: 10px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }' +
    '    .content { padding: 40px; line-height: 1.6; }' +
    '    .greeting { font-family: "Georgia", serif; font-size: 24px; color: #1A1A1A; margin-top: 0; margin-bottom: 10px; font-style: italic; }' +
    '    .unlock-sub { font-size: 16px; color: #71717A; margin-bottom: 30px; font-weight: 300; }' +
    '    .badge { display: inline-block; background-color: #EEFBF3; border: 1px solid #C6F6D5; color: #22543D; font-size: 13px; font-weight: bold; padding: 6px 16px; border-radius: 9999px; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px; }' +
    '    .section-title { font-family: "Georgia", serif; font-size: 18px; color: #CD201F; font-weight: bold; border-bottom: 1px solid #F4F4F5; padding-bottom: 8px; margin-top: 30px; margin-bottom: 12px; font-style: italic; }' +
    '    .section-content { background-color: #F9F8F6; border-radius: 12px; padding: 18px 20px; font-size: 15px; color: #27272A; border-left: 4px solid #1A1A1A; margin-bottom: 25px; white-space: pre-wrap; font-style: italic; }' +
    '    .footer { background-color: #F9F8F6; padding: 30px; text-align: center; font-size: 12px; color: #71717A; border-top: 1px solid #E4E4E7; }' +
    '    .footer a { color: #CD201F; text-decoration: none; font-weight: bold; }' +
    '  </style>' +
    '</head>' +
    '<body>' +
    '  <div class="container">' +
    '    <div class="header">' +
    '      <h1>JECRC UNIVERSITY</h1>' +
    '      <p>Time Capsule 2026</p>' +
    '    </div>' +
    '    <div class="content">' +
    '      <div class="badge">🔓 Unlocked</div>' +
    '      <p class="greeting">Hello ' + fullName + ',</p>' +
    '      <p class="unlock-sub">The wait is over. Welcome to the future.</p>' +
    '      <p>Years ago, as you stepped into JECRC University, you sealed a piece of your soul, your dreams, and your fears into the Time Capsule.</p>' +
    '      <p>Today, your capsule is officially unlocked. Take a look at who you were, and reflect on who you have become:</p>' +
    '      ' +
    '      <div class="section-title">One Dream</div>' +
    '      <div class="section-content">" ' + dream + ' "</div>' +
    '      ' +
    '      <div class="section-title">One Fear</div>' +
    '      <div class="section-content">" ' + fear + ' "</div>' +
    '      ' +
    '      <div class="section-title">One Promise</div>' +
    '      <div class="section-content">" ' + promise + ' "</div>' +
    '      ' +
    '      ' + mediaEmbedHtml + mediaButtonHtml +
    '      ' +
    '      <p style="margin-top: 40px;">No matter where you are or what path you have walked since orientation, we hope you kept your promise. Be proud of how far you have come.</p>' +
    '      <p style="font-weight: bold; margin-top: 25px;">Congratulations on your graduation!</p>' +
    '    </div>' +
    '    <div class="footer">' +
    '      <p>Managed by <a href="https://www.instagram.com/socialzbts" target="_blank">JU Socialz</a> &bull; JECRC University</p>' +
    '    </div>' +
    '  </div>' +
    '</body>' +
    '</html>';
}
