const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

exports.sendOtpMail = async (to, otp) => {
  const mailOptions = {
    from: `"SmartStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your SmartStore OTP',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>🔐 Your One-Time Password (OTP)</h2>
        <p>Use the following OTP to reset your password:</p>
        <h1 style="color: #2e7d32;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ OTP sent to ${to}`)
  } catch (err) {
    console.error('❌ Error sending OTP:', err)
    throw err
  }
}


// BREVO EMAIL SENDER LOGIC FOR OTP

const Sib = require('sib-api-v3-sdk')

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY

exports.sendotp=async (email, otp) => {
  const tranEmailApi = new Sib.TransactionalEmailsApi()

  const sender = {
    email: 'snehal9140@gmail.com', // Replace with your sender email
    name: 'SmartStore'
  }

  const receivers = [{ email }]

  await tranEmailApi.sendTransacEmail({
    sender,
    to: receivers,
    subject: 'Your OTP for SmartStore Password Reset',
    textContent: `Your OTP is: ${otp}`,
    htmlContent: `<h2>SmartStore Password Reset</h2><p>Your OTP is: <strong>${otp}</strong></p>`
  })
}


