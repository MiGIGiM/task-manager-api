require('../db/mongoose')
const multer = require('multer')
const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/auth')
const { sendWelcomeEmail, sendCancelledEmail } = require('../emails/account')

const router = new express.Router()

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {

    const allowedExtensions = [
      'image/jpeg',
      'image/png'
    ]
    if (!allowedExtensions.some((ext) => ext === file.mimetype)) {
      return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  }
})

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()

    const token = await user.generateAuthToken()
    sendWelcomeEmail(user.email, user.name)
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

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  try {
    updates.forEach((update) => req.user[update] = req.body[update])

    await req.user.save()

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates' })

    res.status(200).send(req.user)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()

    res.send(req.user)
    sendCancelledEmail(req.user.email, req.user.name)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  req.user.avatar = req.file.buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send({ message: 'Profile picture deleted' })
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.get('/users/:id/avatar', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const user = await User.findById(_id)

    if (!user || !user.avatar) throw new Error('Not found')

    res.set('Content-Type', 'image/jpg')

    res.send(user.avatar)

  } catch (e) {
    res.status(404).send({ error: e.message })
  }
})

module.exports = router