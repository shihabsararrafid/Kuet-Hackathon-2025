import nodemailer from "nodemailer";
import { emailConfig } from "../../configs/config.email";

export default class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(_to: string, subject: string, html: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: "shrafid.532@gmail.com",
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}
