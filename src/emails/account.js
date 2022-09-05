const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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