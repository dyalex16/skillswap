import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4
})

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:5000/api/auth/verify/${token}`

  await transporter.sendMail({
    from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your SkillSwap account',
    html: `
      <h2>Welcome to SkillSwap!</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  })
}