# Presidential Elections System 

 ### PSA Voting Verification - Google Apps Script
 
 #### Flow:
  1. User submits the Verification Google Form.
  2. This script runs automatically on form submit.
  3. It checks the PSA Members Sheet.
  4. It emails the user:
   - Voting form link if member exists and payment is verified
   - Payment not verified message if member exists but payment is not verified
   - Membership form link if member does not exist
 
 #### Setup:
   1. Open the Google Sheet connected to your Verification Google Form
   2. Go to Extensions → Apps Script.
   3. Paste this code.
   4. Replace the config values below.
   5. Click Triggers → Add Trigger.
   6. Choose:
     - Function: onVerificationFormSubmit
     - Event source: From spreadsheet
     - Event type: On form submit

 
