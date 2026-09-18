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
