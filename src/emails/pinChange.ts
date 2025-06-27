export default ({ name }: { name: string }) => ({
  html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PIN Changed Notification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #F1FAEF;
        color: #616161;
      }
      .email-container {
        max-width: 600px;
        margin: auto;
        background-color: #FBFEFB;
        border-radius: 12px;
        padding: 20px;
      }
      .header {
        padding-bottom: 20px;
      }
      .header img {
        width: 30px;
      }
      .content h1 {
        color: #000000;
        font-size: 24px;
      }
      .content p {
        font-size: 16px;
        color: #616161;
        line-height: 1.6;
      }
      .content a.button {
        display: inline-block;
        background-color: #FFC107;
        color: #000000;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 20px;
        margin-top: 20px;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 12px;
        color: #aaa;
      }
      .footer a {
        color: #555;
        text-decoration: none;
      }
      .footerSpan {
        color: #FFC107;
        font-size: 14px;
        font-weight: bold;
      }
      .footerCopy {
        text-align: center;
        font-size: 12px;
        color: #999;
        margin-top: 30px;
      }
      @media screen and (max-width: 480px) {
        .content h1 {
          font-size: 20px;
        }
        .content p {
          font-size: 14px;
        }
        .content a.button {
          padding: 10px 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img src="https://res.cloudinary.com/dpmx02shl/image/upload/v1747069311/logo_saspld.png" alt="Texel Chain Logo">
      </div>
      <div class="content">
        <h1>PIN Change Confirmation</h1>
        <p>Hi ${name},</p>
        <p>We wanted to let you know that your account PIN was recently changed.</p>
        <p>If you authorized this change, no further action is needed.</p>
        <p><strong>If you did <span style="color: #F75555;">not</span> authorize this PIN change, please contact us immediately for assistance.</strong></p>
        <a href="mailto:support@texelchain.org" class="button">Contact Support</a>
      </div>
    </div>
    <div class="footer">
      <p><span class="footerSpan">Texel Chain</span> at the touch of a button! Download our app for:</p>
      <p>
        <a href="https://play.google.com">Google Play</a> |
        <a href="https://apps.apple.com">App Store</a>
      </p>
      <p>
        <span>Need help? Reach us at <a href="mailto:support@texelchain.org">support@texelchain.org</a></span><br/>
        <span>Follow us on Twitter, Facebook, and Instagram to stay updated</span>
      </p>
      <p>Don’t want more emails from us? <a href="#" style="color: #F75555;">Unsubscribe</a></p>
      <p class="footerCopy">&copy; ${new Date().getFullYear()} Texel Chain. All rights reserved.</p>
    </div>
  </body>
  </html>`,
});
