import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendBookingConfirmation(
  email: string,
  customerName: string,
  barberName: string,
  serviceName: string,
  date: string,
  time: string,
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Booking Confirmation",
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Hi ${customerName},</p>
      <p>Your booking with ${barberName} has been confirmed.</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p>See you soon!</p>
    `,
  })
}

export async function sendReminderEmail(email: string, customerName: string, barberName: string, time: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Booking Reminder",
    html: `
      <h2>Reminder: Your appointment is coming up!</h2>
      <p>Hi ${customerName},</p>
      <p>This is a reminder that you have an appointment with ${barberName} in 1 hour at ${time}.</p>
      <p>Please arrive on time!</p>
    `,
  })
}
