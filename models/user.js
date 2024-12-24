const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
    verificationCode: String,
    verificationCodeExpiresAt: String,

    role: {
      type: String,
      enum: ['user', 'accountant', 'manager', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
    delete returnedObject.resetPasswordToken
    delete returnedObject.resetPasswordTokenExpiresAt
    delete returnedObject.verificationCode
    delete returnedObject.verificationCodeExpiresAt
  },
})

module.exports = mongoose.model('User', userSchema)
