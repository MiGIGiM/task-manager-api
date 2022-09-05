const sgMail = require('@sendgrid/mail')
const sendgripKey = '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'

sgMail.setApiKey(sendgripKey)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'fm.rodriguezg@hotmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Bisteba`
  })
}

const sendCancelledEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'fm.rodriguezg@hotmail.com',
    subject: ':(',
    text: `We're sad to see you go, ${name} :(`,
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelledEmail
}