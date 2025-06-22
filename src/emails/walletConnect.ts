export const walletConnect = ({
  name,
  wallet,
  date,
}: WalletConnectEmailParams) => ({
  subject: '🔗 Wallet Connected Successfully',
  html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Wallet Connected</title>
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
        color: #FFC107;
        margin: 16px 0 8px;
      }
      .content {
        font-size: 16px;
        line-height: 1.6;
      }
      .highlight {
        font-weight: 600;
        color: #1f2937;
      }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
        margin-top: 32px;
      }
      .accent {
        color: #FFC107;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dpmx02shl/image/upload/v1747069311/logo_saspld.png" alt="Texel Chain Logo" />
        <h1 class="title">Wallet Connected</h1>
      </div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your wallet <span class="highlight">${wallet}</span> was successfully connected to your account on <strong>${date}</strong>.</p>
        <p>You can now seamlessly interact with your wallet within the Texel Chain platform.</p>
        <p>If you did not perform this action, please contact support immediately to secure your account.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <span class="accent">Texel Chain</span>. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`,
});
