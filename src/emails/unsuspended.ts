export default ({ name }: { name: string }) => ({
  subject: '✅ Your Texel Chain Account Has Been Restored',
  html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Restored</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #F1FAEF; color: #616161; margin: 0; padding: 0; }
      .email-container { max-width: 600px; margin: auto; background-color: #FBFEFB; border-radius: 12px; padding: 20px; }
      .content h1 { color: #2E7D32; font-size: 24px; }
      .content p { font-size: 16px; color: #616161; line-height: 1.6; }
      .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="content">
        <h1>Account Restored</h1>
        <p>Hi ${name},</p>
        <p>We're happy to let you know that your Texel Chain account has been successfully unsuspended. You now have full access to your account and services.</p>
        <p>If you have any questions or concerns, please don’t hesitate to reach out to our support team.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Texel Chain. All rights reserved.
      </div>
    </div>
  </body>
  </html>`,
});
