const { Router } = require('express')
const Entite = require('../models/entite')

const router = Router()

router.get('/', async (req, res) => {
  const customers = await Entite.find({ type: 'customer' })
  res.json(customers)
})

router.post('/', async (req, res, next) => {
  const { name } = req.body
  try {
    const customer = new Entite({ name, type: 'customer' })

    const savedCustomer = await customer.save()

    res.status(201).json(savedCustomer)
  } catch (error) {
    next(error)
  }
})

module.exports = router
