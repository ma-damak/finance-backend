const { Router } = require('express')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const {
  tokenExtractor,
  userExtractor,
  requireAdmin,
} = require('../utils/middleware')
const Check = require('../models/check')

const router = Router()

router.get('/', async (req, res) => {
  const checks = await Check.find({}).populate('entite')
  res.json(checks)
})

router.get('/pagination', async (req, res, next) => {
  try {
    const search = req.query.search || ''
    const page = req.query.page || 1
    const size = req.query.size || 10
    const dueDateSort = req.query.sort || 1
    const filter = req.query.filter || ''

    const query = {
      status: { $regex: filter, $options: 'i' },
    }

    const totalChecks = await Check.countDocuments(query)

    const checks = await Check.find(query)
      .sort({ dueDate: Number(dueDateSort) })
      .skip((page - 1) * size)
      .limit(size)
      .populate('entite')

    const totalPages = Math.ceil(totalChecks / size)

    res.json({ checks, totalPages, totalChecks })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const check = await Check.findById(id)
    if (check) {
      res.json(check)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  const { bank, amount, dueDate, type, status, entite } = req.body
  try {
    if (!bank || !amount || !dueDate) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (!/^\d+(\.\d{1,3})?$/.test(amount)) {
      return res.status(400).json({ error: 'invalid amount' })
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return res.status(400).json({ error: 'invalid date' })
    }

    const check = new Check({ bank, amount, dueDate, type, status, entite })
    const savedCheck = await check.save()
    res.status(201).json(savedCheck)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  const { id } = req.params
  const { bank, amount, dueDate, type, status, entite } = req.body
  try {
    const updatedCheck = await Check.findByIdAndUpdate(
      id,
      {
        bank,
        amount,
        dueDate,
        type,
        status,
        entite,
      },
      { new: true, runValidators: true }
    )
    res.json(updatedCheck)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await Check.findByIdAndDelete(req.params.id)
    return res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router
