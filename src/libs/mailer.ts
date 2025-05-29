import nodemailer, { SendMailOptions } from "nodemailer";
import { app } from "../app";

//Config
import { SMTP_USER, SMTP_PASSWORD, SMTP_HOST } from "../config";

const defaultHost = SMTP_HOST;

function createTransporter() {
  return nodemailer.createTransport({
    host: defaultHost,
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

export async function sendEmail(payload: SendMailOptions) {

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail(payload);
    app.log.info(`Email sent successfully: ${info.response}`);

  } catch (error) {
    app.log.fatal(`Error sending email: ${error}`);
  }
}