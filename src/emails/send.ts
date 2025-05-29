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
      background-color: #f4f4f4;
      font-family: Arial, sans-serif;
      color: #333;
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 10px;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header img {
      width: 40px;
    }
    .content h2 {
      color: #2e7d32;
    }
    .content p {
      line-height: 1.6;
    }
    .transaction-details {
      margin-top: 20px;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
    .transaction-details strong {
      display: inline-block;
      width: 150px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dpmx02shl/image/upload/v1747069311/logo_saspld.png" alt="Texel Chain Logo" />
    </div>
    <div class="content">
      <h2>Transaction Successful</h2>
      <p>Hi ${name},</p>
      <p>You've successfully sent <strong>${amount} ${coin.toUpperCase()}</strong> on <strong>${date}</strong>.</p>
      <div class="transaction-details">
        <p><strong>Coin:</strong> ${coin}</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>To Wallet:</strong> ${walletAddress}</p>
        <p><strong>Transaction Hash:</strong> ${transactionHash}</p>
      </div>
      <p>If this transaction wasn't made by you, please contact us immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Texel Chain. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
});
