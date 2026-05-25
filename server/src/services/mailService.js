import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.SERVER_URL}/api/auth/verify/${token}`

  await resend.emails.send({
    from: 'SkillSwap <onboarding@resend.dev>',
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