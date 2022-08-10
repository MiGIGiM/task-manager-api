require('../db/mongoose')
const express = require('express')
const Task = require('../models/task')
const auth = require('../middlewares/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({...req.body, owner: req.user._id })

  try {
    await task.save()

    res.status(201).send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.get('/tasks', auth, async (req, res) => {
  try {
    await req.user.populate('tasks').execPopulate()

    res.status(200).send({ data: req.user.tasks })
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) { throw Error('No task found') }

    res.status(200).send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })

  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates' })

    if (!task) return res.status(404).send({ error: "Task not found" })

    updates.forEach((update) => task[update] = req.body[update])

    await task.save()

    res.status(200).send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })
    console.log(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) return res.status(404).send({ error: 'No task found' })

    res.send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

module.exports = router
