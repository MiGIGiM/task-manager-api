const express = require('express')
require('../db/mongoose')
const Task = require('../models/task')

const router = new express.Router()

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body)

  try {
    await task.save()

    res.status(201).send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({})
    res.status(200).send({ data: tasks })
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

router.get('/tasks/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findById(_id)

    if (!task) { throw Error('No task found') }

    res.status(200).send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })

  }
})

router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  try {
    const task = await Task.findById(req.params.id)

    updates.forEach((update) => task[update] = req.body[update])

    await task.save()

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates' })

    if (!task) return res.status(404).send({ error: "Task not found" })

    res.status(200).send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })
    console.log(e)
  }
})

router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) return res.status(404).send({ error: 'No task found' })

    res.send(task)
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})

module.exports = router
