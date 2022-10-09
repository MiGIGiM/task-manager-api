const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Pedro',
  email: 'pedro@example.com',
  password: 'MyPass789!',
  tokens: [{
    token: jwt.sign({_id: userOneId }, process.env.JWT_SECRET)
  }]
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

test('Should sign up a new user', async () => {
  const res = await request(app).post('/users').send({
    name: 'Miguel',
    email: 'miguel@example.com',
    password: 'MyPass789!'
  }).expect(201)

  // * Assert that the DB was changed correctly
  const user = await User.findById(res.body.user._id)

  expect(user).not.toBeNull()

  // * Assertings about the response
  expect(res.body).toMatchObject({ 
    user: {
      name: 'Miguel'
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe('MyPass789!')
})

test('Should log in existing user', async () => {
  const res = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password,
  }).expect(200)

  const user = await User.findById(res.body.user._id)

  expect(res.body).toMatchObject({
    token: user.tokens[1].token
  })

})

test('Should not login not existing user', async () => {
  await request(app).post('/users/login').send({
    email: 'aaa@email.com',
    password: 'Contra1234!'
  }).expect(400)
})

test('Should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  const { body } = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(body._id)
  expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async() => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/frog.jpg')
    .expect(200)

  const user = await User.findById(userOneId)

  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'Juan' })
    .expect(200)

  const user = await User.findById(userOneId)

  expect(user.name).toBe('Juan')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ location: 'mi casa' })
    .expect(400)

  const user = await User.findById(userOneId)
})
