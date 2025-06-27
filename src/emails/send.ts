export default ({
  name,
  coin,
  amount,
  walletAddress,
  transactionHash,
  date,
  status,
}: TransactionEmailParams) => {
  const primaryColor = '#FFC107';

  const statusMap = {
    successful: {
      icon: '✅',
      title: 'Transaction Confirmed',
      message: 'Your transaction has been processed successfully.',
      color: '#10b981',
    },
    pending: {
      icon: '⏳',
      title: 'Transaction Pending',
      message: `Your transaction is currently being processed. It will be confirmed shortly. 
        If you do not receive it within 5 minutes, we kindly ask you to confirm your withdrawal by contacting the company's support team`,
      color: '#f59e0b',
    },
    failed: {
      icon: '❌',
      title: 'Transaction Failed',
      message: 'Unfortunately, your transaction could not be processed.',
      color: '#ef4444',
    },
  };

  const { icon, title, message, color } = statusMap[status];

  return {
    subject: `${icon} ${coin.toUpperCase()} Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
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
      font-size: 20px;
      color: ${color};
      margin: 16px 0 8px;
    }
    .content {
      font-size: 14px;
      line-height: 1.4;
    }
    .details {
      background: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
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
    .highlight {
      color: ${primaryColor};
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dpmx02shl/image/upload/v1747069311/logo_saspld.png" alt="Texel Chain Logo" />
      <h1 class="title">${title}</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>${message}</p>
      <div class="details">
        <p><span class="label">Coin:</span> ${coin.toUpperCase()}</p>
        <p><span class="label">Amount:</span> ${amount}</p>
        <p><span class="label">To Wallet:</span> ${walletAddress}</p>
        <p><span class="label">Transaction Hash:</span> ${transactionHash}</p>
        <p><span class="label">Date:</span> ${date}</p>
      </div>
      ${
        status === 'failed'
          ? `<p>Please double-check the provided details or contact our support team for further assistance.</p>`
          : `<p>If you did not authorize this transaction, please contact our support team immediately.</p>`
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
