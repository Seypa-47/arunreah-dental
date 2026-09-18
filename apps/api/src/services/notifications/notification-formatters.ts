import type { AppointmentNotificationPayload } from './types';

function doctorName(payload: AppointmentNotificationPayload) {
  return payload.doctorName ?? 'No preference';
}

function notes(payload: AppointmentNotificationPayload) {
  return payload.notes ? payload.notes : 'None';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function appointmentEmailSubject(payload: AppointmentNotificationPayload) {
  return `New Appointment Request — ${payload.reference}`;
}

export function appointmentEmailText(payload: AppointmentNotificationPayload) {
  return [
    '============================================================',
    '                  ARUNREAH DENTAL CLINIC',
    '             New Appointment Request Received',
    '============================================================',
    '',
    `Appointment Reference: ${payload.reference}`,
    'Status: PENDING',
    'Clinic review and manual confirmation are required.',
    '',
    '------------------------------------------------------------',
    'PATIENT INFORMATION',
    '------------------------------------------------------------',
    `Patient Name: ${payload.patientName}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    '',
    '------------------------------------------------------------',
    'APPOINTMENT DETAILS',
    '------------------------------------------------------------',
    `Service: ${payload.serviceName}`,
    `Doctor: ${doctorName(payload)}`,
    `Branch: ${payload.branchName}`,
    `Preferred Date: ${payload.preferredDate}`,
    `Preferred Time: ${payload.preferredTime}`,
    '',
    'Notes:',
    notes(payload),
    '',
    '============================================================',
    'This is an automated operational notification for clinic staff.',
  ].join('\n');
}

export function appointmentEmailHtml(payload: AppointmentNotificationPayload) {
  const patientNotes = payload.notes
    ? escapeHtml(payload.notes)
    : 'No special notes provided by patient.';
  const notesStyle = payload.notes
    ? 'color: #1e293b; font-style: normal;'
    : 'color: #94a3b8; font-style: italic;';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Appointment Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #005687 0%, #075d83 100%); padding: 28px 32px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px;">
                      New Request
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
                      Arunreah Dental Clinic
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #d0e8f2; font-size: 14px; font-weight: 500;">
                      Reception Notification Desk
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 32px;">
              
              <!-- Reference & Status Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
                      Appointment Reference
                    </span>
                    <span style="font-size: 17px; font-weight: 800; color: #005687; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.02em;">
                      ${escapeHtml(payload.reference)}
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em;">
                      Pending
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Notice Callout -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 12px 16px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 13px; line-height: 20px; color: #1e40af; font-weight: 500;">
                    <strong>Notice:</strong> Clinic review and manual confirmation are required before scheduling.
                  </td>
                </tr>
              </table>

              <!-- Patient Information Section -->
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em;">
                Patient Information
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; width: 35%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Patient Name
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(payload.patientName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Phone Number
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 600; color: #005687; border-bottom: 1px solid #e2e8f0;">
                    <a href="tel:${escapeHtml(payload.phone)}" style="color: #005687; text-decoration: none; font-weight: 700;">
                      ${escapeHtml(payload.phone)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569;">
                    Email Address
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 600; color: #005687;">
                    <a href="mailto:${escapeHtml(payload.email)}" style="color: #005687; text-decoration: none;">
                      ${escapeHtml(payload.email)}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Appointment Details Section -->
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em;">
                Appointment Details
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; width: 35%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Service
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(payload.serviceName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Doctor
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 600; color: #334155; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(doctorName(payload))}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Branch
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 600; color: #334155; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(payload.branchName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569;">
                    Preferred Date &amp; Time
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 700; color: #005687;">
                    ${escapeHtml(payload.preferredDate)} &nbsp;•&nbsp; ${escapeHtml(payload.preferredTime)}
                  </td>
                </tr>
              </table>

              <!-- Patient Notes Section -->
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em;">
                Patient Notes
              </h2>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 13px; line-height: 20px; ${notesStyle}">
                ${patientNotes}
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 18px;">
                Arunreah Dental Clinic Management System<br>
                This automated notification was generated upon receiving an online booking request.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function appointmentTelegramText(payload: AppointmentNotificationPayload) {
  const lines = [
    'New Appointment Request',
    '',
    `Ref: ${payload.reference}`,
    `Patient: ${payload.patientName}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Service: ${payload.serviceName}`,
    `Doctor: ${doctorName(payload)}`,
    `Branch: ${payload.branchName}`,
    `Date: ${payload.preferredDate}`,
    `Time: ${payload.preferredTime}`,
    'Status: PENDING',
  ];

  if (payload.notes) lines.push(`Notes: ${payload.notes.slice(0, 600)}`);
  return lines.join('\n');
}

export function patientAppointmentEmailSubject(payload: AppointmentNotificationPayload) {
  return `Appointment Request Received — ${payload.reference} | Arunreah Dental Clinic`;
}

export function patientAppointmentEmailText(payload: AppointmentNotificationPayload) {
  return [
    '============================================================',
    '                  ARUNREAH DENTAL CLINIC',
    '             Appointment Request Acknowledgment',
    '============================================================',
    '',
    `Dear ${payload.patientName},`,
    '',
    'Thank you for choosing Arunreah Dental Clinic.',
    'We have received your appointment request. Please note that your appointment',
    'is currently PENDING and will be confirmed once our team verifies schedule availability.',
    '',
    `Appointment Reference: ${payload.reference}`,
    'Status: PENDING REVIEW',
    '',
    '------------------------------------------------------------',
    'REQUESTED APPOINTMENT DETAILS',
    '------------------------------------------------------------',
    `Service: ${payload.serviceName}`,
    `Branch: ${payload.branchName}`,
    `Doctor: ${doctorName(payload)}`,
    `Preferred Date: ${payload.preferredDate}`,
    `Preferred Time: ${payload.preferredTime}`,
    `Contact Phone: ${payload.phone}`,
    '',
    'Notes / Remarks:',
    notes(payload),
    '',
    '------------------------------------------------------------',
    'WHAT HAPPENS NEXT?',
    '------------------------------------------------------------',
    '1. Schedule Review: Our reception desk is verifying doctor availability.',
    '2. Confirmation: Our team will contact you by phone to confirm your appointment.',
    '3. Your Visit: Please arrive 10 minutes prior to your confirmed time.',
    '',
    '------------------------------------------------------------',
    'NEED TO CONTACT US?',
    '------------------------------------------------------------',
    'Toul Tompoung Branch: 098 701 302 / 012 964 200',
    'Psa Chas Branch: 069 978 997 / 061 978 997',
    'Operating Hours: Monday – Sunday, 8:00 AM – 7:00 PM',
    '',
    '============================================================',
    'Arunreah Dental Clinic • Phnom Penh, Cambodia',
    'This is an automated acknowledgment of your appointment request.',
  ].join('\n');
}

export function patientAppointmentEmailHtml(payload: AppointmentNotificationPayload) {
  const patientNotes = payload.notes
    ? escapeHtml(payload.notes)
    : 'No special notes provided.';
  const notesStyle = payload.notes
    ? 'color: #1e293b; font-style: normal;'
    : 'color: #94a3b8; font-style: italic;';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Request Acknowledgment</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #005687 0%, #075d83 100%); padding: 30px 32px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px;">
                      Request Received
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
                      Arunreah Dental Clinic
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #d0e8f2; font-size: 14px; font-weight: 500;">
                      Dental Care &amp; Implant Center
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 32px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 24px; color: #0f172a; font-weight: 700;">
                Dear ${escapeHtml(payload.patientName)},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Thank you for choosing Arunreah Dental Clinic. We have successfully received your appointment request. Our reception desk is reviewing schedule availability and will reach out to confirm your booking.
              </p>

              <!-- Reference & Status Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
                      Appointment Reference
                    </span>
                    <span style="font-size: 17px; font-weight: 800; color: #005687; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.02em;">
                      ${escapeHtml(payload.reference)}
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em;">
                      Pending Review
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Notice Callout -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 12px 16px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 13px; line-height: 20px; color: #1e40af; font-weight: 500;">
                    <strong>Important Note:</strong> This is a request acknowledgment. Your appointment is pending clinic review and will be confirmed once our team contacts you.
                  </td>
                </tr>
              </table>

              <!-- Requested Details Section -->
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em;">
                Requested Details
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; width: 35%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Service
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(payload.serviceName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Branch
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 600; color: #334155; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(payload.branchName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Doctor
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 600; color: #334155; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(doctorName(payload))}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
                    Preferred Schedule
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 700; color: #005687; border-bottom: 1px solid #e2e8f0;">
                    ${escapeHtml(payload.preferredDate)} &nbsp;•&nbsp; ${escapeHtml(payload.preferredTime)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569;">
                    Contact Phone
                  </td>
                  <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; font-weight: 600; color: #0f172a;">
                    ${escapeHtml(payload.phone)}
                  </td>
                </tr>
              </table>

              <!-- Notes Section -->
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em;">
                Notes / Special Requests
              </h2>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 13px; line-height: 20px; margin-bottom: 28px; ${notesStyle}">
                ${patientNotes}
              </div>

              <!-- Next Steps Timeline -->
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.06em;">
                What Happens Next?
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 28px;">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top">
                          <span style="display: inline-block; width: 22px; height: 22px; background-color: #005687; color: #ffffff; font-size: 12px; font-weight: 700; line-height: 22px; text-align: center; border-radius: 50%;">1</span>
                        </td>
                        <td style="padding-left: 8px; font-size: 13px; line-height: 19px; color: #334155;">
                          <strong>Schedule Review:</strong> Our reception team checks doctor availability for your selected date and time.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top">
                          <span style="display: inline-block; width: 22px; height: 22px; background-color: #005687; color: #ffffff; font-size: 12px; font-weight: 700; line-height: 22px; text-align: center; border-radius: 50%;">2</span>
                        </td>
                        <td style="padding-left: 8px; font-size: 13px; line-height: 19px; color: #334155;">
                          <strong>Confirmation Call:</strong> We will contact you at <strong>${escapeHtml(payload.phone)}</strong> to confirm your booking.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top">
                          <span style="display: inline-block; width: 22px; height: 22px; background-color: #005687; color: #ffffff; font-size: 12px; font-weight: 700; line-height: 22px; text-align: center; border-radius: 50%;">3</span>
                        </td>
                        <td style="padding-left: 8px; font-size: 13px; line-height: 19px; color: #334155;">
                          <strong>Your Visit:</strong> Please arrive approximately 10 minutes prior to your confirmed appointment time.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Contact & Support -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px dashed #cbd5e1; border-radius: 10px; padding: 16px; background-color: #ffffff;">
                <tr>
                  <td>
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #005687; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
                      Need Direct Assistance?
                    </span>
                    <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 20px; color: #475569;">
                      If you have questions, need urgent care, or wish to modify your request, please call us directly:
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 20px; color: #1e293b;">
                      <tr>
                        <td style="padding: 2px 0;"><strong>Toul Tompoung:</strong> 098 701 302 / 012 964 200</td>
                      </tr>
                      <tr>
                        <td style="padding: 2px 0;"><strong>Psa Chas:</strong> 069 978 997 / 061 978 997</td>
                      </tr>
                      <tr>
                        <td style="padding: 2px 0; color: #64748b; font-size: 12px;">Hours: Mon – Sun, 8:00 AM – 7:00 PM</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 18px;">
                <strong>Arunreah Dental Clinic</strong> • Phnom Penh, Cambodia<br>
                This automated message was sent to confirm receipt of your appointment request.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

