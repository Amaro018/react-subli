import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: '"Subli" <no-reply@subli.com>',
    to,
    subject,
    html,
  }

  await transporter.sendMail(mailOptions)
}
