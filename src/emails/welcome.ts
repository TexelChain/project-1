export default ({ name }: { name: string }) => ({
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Email</title>
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
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 20px;
      margin-top: 20px;
      color: #000000;
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
      .content h1{
        font-size: 20px;
      }
      .code {
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
      <h1>Welcome to Texel Chain</h1>
      <p>Hi ${name},</p>
      <p>Warmest welcome to Texel Chain</p>
      <p>Welcome to Texel Chain! Your secure and seamless gateway to the world of cryptocurrency. Get started with managing your digital assets with just a few clicks. 🎉 <br /><br />
Whether you're here to securely store, send, or receive your crypto, you're in the right place.</p>    
      <p style="color: #000000; font-weight: 600">Here's what you can expect on Texel Chain:</p>
      <ol>
        <li style="margin-top: 10px">✅ Easy management of your digital currencies.</li>
        <li style="margin-top: 10px">✅ Store, send or receive cryptocurrency easily.</li>
        <li style="margin-top: 10px">✅ Safe and secure payment system.</li>
        <li style="margin-top: 10px">✅ A growing community built on quality service.</li>
      </ol>
      <a href="#" class="button">Continue Exploring</a>
    </div>
  </div>
    <div class="footer">
      <p><span class="footerSpan">Texel Chain</span> at the touch of a button! Download our app for:</p>
      <p>
        <a href="https://play.google.com">Google Play</a> |
        <a href="https://apps.apple.com">App Store</a>
      </p>
      <p>
       <span>Questions or concerns? Get in touch with us at <a href="mailto:support@texelchain.org">support@texelchain.org</a></span> <br />
       <span>Never miss a beat! Follow us on Twitter, Facebook and Instagram</span>
      </p>
      <p>Don't want any more emails from us? <a href="#" style="color: #F75555;">Unsubscribe</a></p>
      <p class="footerCopy">&copy; ${new Date().getFullYear()} Texel Chain. All rights reserved.</p>
    </div>
</body>
</html>`,
});
