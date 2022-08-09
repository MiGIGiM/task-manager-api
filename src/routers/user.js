const express = require('express')
require('../db/mongoose')
const User = require('../models/user')

const router = new express.Router()

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    res.status(201).send(user)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }

})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})

    res.status(200).send({ data: users })
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);

    if (!user) return res.status(400).send({ error: 'User not found' })

    res.status(200).send(user)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.patch('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates' })

    if (!user) return res.status(404).send({ error: 'No user found' })

    res.status(200).send(user)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) return res.status(404).send({ error: 'No user found' })

    res.send(user)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

module.exports = router