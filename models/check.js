const mongoose = require('mongoose')

const checkSchema = new mongoose.Schema({
  bank: {
    type: String,
    required: true,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['versable', 'garentie'],
    default: 'versable',
  },
  status: {
    type: String,
    enum: ['enCours', 'solde'],
    default: 'enCours',
  },
  entite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entite',
    required: true,
  },
})

checkSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.amount = returnedObject.amount.toString()
    returnedObject.dueDate = returnedObject.dueDate.toISOString().split('T')[0]
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Check', checkSchema)
