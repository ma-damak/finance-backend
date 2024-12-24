require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

const SECRET = process.env.SECRET

const NODEMAILER_USER = process.env.NODEMAILER_USER
const NODEMAILER_PASS = process.env.NODEMAILER_PASS

const CLIENT_URL = process.env.CLIENT_URL

module.exports = {
  PORT,
  MONGODB_URI,
  SECRET,
  NODEMAILER_USER,
  NODEMAILER_PASS,
  CLIENT_URL,
}
