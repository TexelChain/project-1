export default ({ name, status, reason }: KycEmailParams) => {
  const primaryColor = '#FFC107';
  const isApproved = status === 'accepted';

  return {
    subject: isApproved
      ? '🎉 Your KYC Has Been Approved'
      : '⚠️ KYC Verification Rejected',
    html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>KYC Status Notification</title>
    <style>
      body {
        background-color: #f9fafb;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1f2937;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 30px 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        text-align: center;
        margin-bottom: 24px;
      }
      .header img {
        width: 48px;
      }
      .title {
        font-size: 22px;
        color: ${isApproved ? '#10b981' : '#ef4444'};
        margin: 16px 0 8px;
      }
      .content {
        font-size: 16px;
        line-height: 1.6;
      }
      .reason-box {
        background: #fef3c7;
        padding: 16px;
        border-radius: 8px;
        margin: 24px 0;
        color: #92400e;
        border: 1px solid #fcd34d;
      }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        margin-top: 32px;
      }
      .highlight {
        color: ${primaryColor};
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dpmx02shl/image/upload/v1747069311/logo_saspld.png" alt="Texel Chain Logo" />
        <h1 class="title">KYC ${isApproved ? 'Approved' : 'Rejected'}</h1>
      </div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        ${
          isApproved
            ? `<p>We are pleased to inform you that your KYC verification has been <strong>successfully approved</strong>. You now have full access to all features on the platform.</p>`
            : `<p>Unfortunately, your KYC verification has been <strong>rejected</strong>. This means we were unable to verify your identity with the documents provided.</p>`
        }
        ${
          !isApproved && reason
            ? `<div class="reason-box"><strong>Reason:</strong> ${reason}</div>`
            : ''
        }
        ${
          !isApproved
            ? `<p>Kindly review and resubmit your documents for another verification attempt. If you need assistance, our support team is here to help.</p>`
            : ''
        }
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <span class="highlight">Texel Chain</span>. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`,
  };
};
