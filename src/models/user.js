const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    unique: true,
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
  },
  tokens: [{
    token: {
      type: String,
      require: true
    }
  }]
})

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if (!User) throw new Error('Unable to login')

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) throw new Error('Unable to login')

  return user
}

userSchema.methods.generateAuthToken = async function () {
  const user = this

  const token = jwt.sign({ _id: user.id.toString() }, 'DOMExKANO')

  user.tokens = user.tokens.concat({ token })

  await user.save()

  return token;
}

userSchema.methods.toJSON = function() {
  const user = this
  const userObj = user.toObject()

  delete userObj.password
  delete userObj.tokens
  delete userObj.__v

  return userObj
}

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
