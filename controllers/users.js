const { Router } = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const crypto = require('crypto')

const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} = require('../nodemailer/emails')

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: '3d' })
}

const generateVerificationCode = () => {
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += digits[Math.floor(Math.random() * 10)]
  }
  return code
}

const router = Router()

router.get('/', async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

router.post('/signup', async (req, res, next) => {
  const { email, password } = req.body
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email is not valid' })
    }
    // if (!validator.isStrongPassword(password)) {
    //   return res.status(400).json({ error: 'Password is not strong enough' })
    // }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    const salt = 10
    const passwordHash = await bcrypt.hash(password, salt)

    const verificationCode = generateVerificationCode()

    const user = new User({
      email,
      passwordHash,
      verificationCode,
      // in 24 hours
      verificationCodeExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    })

    const savedUser = await user.save()
    await sendVerificationEmail(savedUser.email, savedUser.verificationCode)
    res.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' })
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'You should verify your account' })
    }

    const token = createToken(user._id)
    res.status(200).json({ email, token })
  } catch (error) {
    next(error)
  }
})

router.post('/verify-email', async (req, res, next) => {
  const { code } = req.body

  try {
    const user = await User.findOne({
      verificationCode: code,
      verificationCodeExpiresAt: { $gt: Date.now() },
    })

    if (!user) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired verification code' })
    }

    user.isVerified = true
    user.verificationCode = undefined
    user.verificationCodeExpiresAt = undefined

    const savedUser = await user.save()
    await sendWelcomeEmail(savedUser.email)

    const token = createToken(savedUser._id)
    res.status(200).json({ email: savedUser.email, token })
  } catch (error) {
    next(error)
  }
})

router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: 'User not found' })
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex')
    const resetPasswordTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1hour

    user.resetPasswordToken = resetPasswordToken
    user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt

    const savedUser = await user.save()

    await sendPasswordResetEmail(
      savedUser.email,
      `${config.CLIENT_URL}/reset-password/${resetPasswordToken}`
    )

    res.status(200).json({ message: 'Password reset link sent to your email' })
  } catch (error) {
    next(error)
  }
})

router.post('/reset-password/:token', async (req, res, next) => {
  const { token } = req.params
  const { password } = req.body

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    const salt = 10
    const passwordHash = await bcrypt.hash(password, salt)

    user.passwordHash = passwordHash

    user.resetPasswordToken = undefined
    user.resetPasswordTokenExpiresAt = undefined
    const savedUser = await user.save()

    await sendResetSuccessEmail(savedUser.email)
    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    next(error)
  }
})

module.exports = router
