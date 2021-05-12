const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
} else {
  const password = process.argv[2]

  const url =
    `mongodb+srv://fullstack-2021:${password}@cluster0.06cjt.mongodb.net/phonebook?retryWrites=true&w=majority`

  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

  const contactSchema = new mongoose.Schema({
    name: String,
    number: String
  })
  
  const Contact = mongoose.model('Contact', contactSchema)

  if (process.argv.length === 3) {
    console.log("Phonebook:")
    Contact.find({}).then(result => {
      result.forEach(contact => {
        console.log(contact.name, contact.number)
      })
      mongoose.connection.close()
    })
  } else {
    
    const contact = new Contact({
      name: process.argv[3],
      number: process.argv[4]
    })
    
    contact.save().then(response => {
      console.log('Added', contact.name, contact.number, 'to phonebook')
      mongoose.connection.close()
    })
  }
}

