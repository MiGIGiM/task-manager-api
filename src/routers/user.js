require('../db/mongoose')
const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/auth')

const router = new express.Router()

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()

    const token = await user.generateAuthToken()

    res.status(201).send({ token, user })
  } catch (e) {
    res.status(400).send({ error: e.message })
  }

})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()

    res.send({ token, user })
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)

    await req.user.save()

    res.send('Logged out')
  } catch (e) {
    req.status(400).send({ error: e.message })
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()

    res.send('All sessions closed')
  } catch (e) {
    res.status(400).send({ e: e.message })
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
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
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    const user = await User.findById(req.params.id)

    updates.forEach((update) => user[update] = req.body[update])

    await user.save()

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