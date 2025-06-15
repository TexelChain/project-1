type TransactionEmailParams = {
  name: string;
  coin: string;
  amount: number;
  walletAddress: string;
  transactionHash: string;
  date: string;
};

export default ({
  name,
  coin,
  amount,
  walletAddress,
  transactionHash,
  date,
}: TransactionEmailParams) => ({
  subject: `✅ ${coin.toUpperCase()} Sent Successfully`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Transaction Notification</title>
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
      color: #10b981;
      margin: 16px 0 8px;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
    }
    .details {
      background: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .details p {
      margin: 6px 0;
    }
    .label {
      font-weight: 600;
      color: #374151;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #9ca3af;
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dpmx02shl/image/upload/v1747069311/logo_saspld.png" alt="Texel Chain Logo" />
      <h1 class="title">Transaction Confirmed</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your transaction has been processed successfully. Below are the details of your recent crypto transfer:</p>
      <div class="details">
        <p><span class="label">Coin:</span> ${coin.toUpperCase()}</p>
        <p><span class="label">Amount:</span> ${amount}</p>
        <p><span class="label">To Wallet:</span> ${walletAddress}</p>
        <p><span class="label">Transaction Hash:</span> ${transactionHash}</p>
        <p><span class="label">Date:</span> ${date}</p>
      </div>
      <p>If you did not authorize this transaction, please contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Texel Chain. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
});
