const logger = require('../utils/logger')
const { transporter } = require('./nodemailer')

const {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require('./emailTemplates')

const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: '"Finance App" <mohamedamine.dammak98@gmail.com>',
    to: email,
    subject: 'Verify your email',
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      '{verificationCode}',
      verificationCode
    ),
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info('Verification email sent successfully')
  } catch (error) {
    logger.error('Error sending verification email:', error)
  }
}

const sendWelcomeEmail = async (email) => {
  const mailOptions = {
    from: '"Finance App" <mohamedamine.dammak98@gmail.com>',
    to: email,
    subject: 'Welcome',
    html: '<h1>Welcome to Finance App</h1>',
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info('Welcome email sent successfully')
  } catch (error) {
    logger.error('Error sending welcome email:', error)
  }
}

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: '"Finance App" <mohamedamine.dammak98@gmail.com>',
    to: email,
    subject: 'Reset your password',
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetUrl),
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info('Password reset email sent successfully')
  } catch (error) {
    logger.error('Error sending password reset email:', error)
  }
}

const sendResetSuccessEmail = async (email) => {
  const mailOptions = {
    from: '"Finance App" <mohamedamine.dammak98@gmail.com>',
    to: email,
    subject: 'Successful password reset',
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info('Successful password reset email sent successfully')
  } catch (error) {
    logger.error('Error sending successful password reset email:', error)
  }
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
}
