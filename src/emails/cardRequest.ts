export const cardRequestEmail = ({
  name,
  status,
  date,
}: CardRequestEmailParams) => {
  const isApproved = status === 'successful';
  const isDeclined = status === 'declined';
  const primaryColor = '#FFC107';

  return {
    subject: isApproved
      ? '🎉 Your Card Request Has Been Approved'
      : '📬 Card Request Received',
    html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Card Request Notification</title>
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
        color: ${isApproved ? '#10b981' : primaryColor};
        margin: 16px 0 8px;
      }
      .content {
        font-size: 16px;
        line-height: 1.6;
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
        <h1 class="title">${isApproved ? 'Card Approved' : 'Request Received'}</h1>
      </div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        ${
          isApproved
            ? `<p>We’re happy to inform you that your card request was <strong>approved</strong> on <strong>${date}</strong>.</p>
               <p>You will receive further instructions soon regarding delivery or activation. Please make sure your contact and address details are up to date.</p>`
            : isDeclined
              ? `<p>We regret to inform you that your recent card request has been <strong>declined.</strong> on <strong>${date}</strong>.</p>
              <p>This decision is based on our current credit policy.</p>
              <p>If you believe this is an error or would like to discuss your application further, please contact our customer support team.</p>`
              : `<p>We’ve received your card request on <strong>${date}</strong> and our team is currently reviewing it.</p>
               <p>You’ll be notified once the request is processed. We appreciate your patience and trust in us.</p>`
        }
        <p>If you have any questions, feel free to reach out to our support team.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <span class="highlight">Texel Chain</span>. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`,
  };
};
