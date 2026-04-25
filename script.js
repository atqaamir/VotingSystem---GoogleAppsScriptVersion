// =============================
// CONFIG - EDIT THESE VALUES
// =============================

const MEMBERS_SHEET_ID = "PASTE_MEMBERS_SHEET_ID_HERE";
const MEMBERS_SHEET_NAME = "Members";

const VOTING_FORM_LINK = "PASTE_VOTING_GOOGLE_FORM_LINK_HERE";
const MEMBERSHIP_FORM_LINK = "PASTE_MEMBERSHIP_FORM_LINK_HERE";

// Column names in your Members Sheet
const MEMBER_NAME_COLUMN = "name";
const MEMBER_EMAIL_COLUMN = "email";
const MEMBER_ROLL_NO_COLUMN = "roll_no";
const MEMBER_VERIFIED_COLUMN = "verified";

// Question titles in your Verification Google Form
// These must match the exact form question names / response sheet headers.
const RESPONSE_EMAIL_FIELD = "Email Address";
const RESPONSE_ROLL_NO_FIELD = "Roll No";

// Optional: write processing result back into the form response sheet
const STATUS_COLUMN = "bot_status";


// =============================
// MAIN TRIGGER FUNCTION
// =============================

function onVerificationFormSubmit(e) {
  const responseSheet = e.range.getSheet();
  const rowNumber = e.range.getRow();

  const statusColumnIndex = ensureStatusColumn_(responseSheet);

  const email = getFormValue_(e, RESPONSE_EMAIL_FIELD);
  const rollNo = getFormValue_(e, RESPONSE_ROLL_NO_FIELD);

  if (!email) {
    responseSheet.getRange(rowNumber, statusColumnIndex).setValue("missing_email");
    return;
  }

  const member = findMember_(email, rollNo);

  if (!member) {
    sendMembershipEmail_(email);
    responseSheet.getRange(rowNumber, statusColumnIndex).setValue("sent_membership_form");
    return;
  }

  if (isVerified_(member[MEMBER_VERIFIED_COLUMN])) {
    sendVotingEmail_(email, member[MEMBER_NAME_COLUMN]);
    responseSheet.getRange(rowNumber, statusColumnIndex).setValue("sent_voting_form");
    return;
  }

  sendPaymentNotVerifiedEmail_(email, member[MEMBER_NAME_COLUMN]);
  responseSheet.getRange(rowNumber, statusColumnIndex).setValue("sent_payment_not_verified");
}


// =============================
// MEMBER LOOKUP
// =============================

function findMember_(email, rollNo) {
  const membersSheet = SpreadsheetApp
    .openById(MEMBERS_SHEET_ID)
    .getSheetByName(MEMBERS_SHEET_NAME);

  const rows = membersSheet.getDataRange().getValues();
  const headers = rows[0].map(h => normalize_(h));

  const nameIndex = headers.indexOf(normalize_(MEMBER_NAME_COLUMN));
  const emailIndex = headers.indexOf(normalize_(MEMBER_EMAIL_COLUMN));
  const rollNoIndex = headers.indexOf(normalize_(MEMBER_ROLL_NO_COLUMN));
  const verifiedIndex = headers.indexOf(normalize_(MEMBER_VERIFIED_COLUMN));

  if (emailIndex === -1 || rollNoIndex === -1 || verifiedIndex === -1) {
    throw new Error("Members sheet must contain email, roll_no, and verified columns.");
  }

  const cleanEmail = normalize_(email);
  const cleanRollNo = normalize_(rollNo);

  for (let i = 1; i < rows.length; i++) {
    const rowEmail = normalize_(rows[i][emailIndex]);
    const rowRollNo = normalize_(rows[i][rollNoIndex]);

    if ((cleanEmail && cleanEmail === rowEmail) || (cleanRollNo && cleanRollNo === rowRollNo)) {
      return {
        [MEMBER_NAME_COLUMN]: nameIndex === -1 ? "Member" : rows[i][nameIndex],
        [MEMBER_EMAIL_COLUMN]: rows[i][emailIndex],
        [MEMBER_ROLL_NO_COLUMN]: rows[i][rollNoIndex],
        [MEMBER_VERIFIED_COLUMN]: rows[i][verifiedIndex]
      };
    }
  }

  return null;
}


// =============================
// EMAILS
// =============================

function sendVotingEmail_(email, name) {
  const subject = "  Voting Form";
  const body = `Assalamualaikum ${name || "Member"},

Your membership/payment has been verified.

You may now vote between Haris and Azlan using this Google Form:
${VOTING_FORM_LINK}

Thank you.
  Team`;

  MailApp.sendEmail(email, subject, body);
}

function sendPaymentNotVerifiedEmail_(email, name) {
  const subject = "  Payment Verification Pending";
  const body = `Assalamualaikum ${name || "Member"},

Your payment is not yet verified by the   team.

Please get in touch with the Female President Hajra, or wait for half an hour and try again.

Thank you.
  Team`;

  MailApp.sendEmail(email, subject, body);
}

function sendMembershipEmail_(email) {
  const subject = "  Membership Required";
  const body = `Assalamualaikum,

We could not find your entry in the   members list.

Please fill the membership form first:
${MEMBERSHIP_FORM_LINK}

Thank you.
  Team`;

  MailApp.sendEmail(email, subject, body);
}


// =============================
// HELPERS
// =============================

function getFormValue_(e, fieldName) {
  const values = e.namedValues[fieldName];

  if (!values || values.length === 0) {
    return "";
  }

  return String(values[0]).trim();
}

function normalize_(value) {
  return String(value || "").trim().toLowerCase();
}

function isVerified_(value) {
  const clean = normalize_(value);
  return ["yes", "true", "verified", "1", "paid", "approved"].includes(clean);
}

function ensureStatusColumn_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const cleanHeaders = headers.map(h => normalize_(h));
  const existingIndex = cleanHeaders.indexOf(normalize_(STATUS_COLUMN));

  if (existingIndex !== -1) {
    return existingIndex + 1;
  }

  const newColumnIndex = headers.length + 1;
  sheet.getRange(1, newColumnIndex).setValue(STATUS_COLUMN);
  return newColumnIndex;
}


// =============================
// OPTIONAL TEST FUNCTION
// =============================

function testMemberLookup() {
  const testEmail = "test@example.com";
  const testRollNo = "123";
  const member = findMember_(testEmail, testRollNo);
  Logger.log(member);
}
