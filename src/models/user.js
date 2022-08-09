const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age cannot be negative')
      }
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email')
      }
    }
  },
  password: {
    type: String,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) throw new Error('Password cannot contain "password".')
    }
  }
})

userSchema.pre('save', async function(next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
    console.log(user.password);
  }

  next()
})

const User = mongoose.model('User', userSchema);

module.exports = User
