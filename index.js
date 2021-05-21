require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Contact = require('./models/contact')

// let persons = [
//   {
//     "id": 1,
//     "name": "Arto Hellas",
//     "number": "040-123456"   
//   },
//   {
//     "id": 2,
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523"
//   },
//   {
//     "id": 3,
//     "name": "Dan Abramov",
//     "number": "39-44-5323523"
//   },
//   {
//     "id": 4,
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122"
//   }
// ]

// const generateID = () => {
//   return Math.floor(Math.random() * 1000000)
// }

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan((tokens, req, res) => {
  
  const baseString = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
  
  if (tokens.method(req, res) === 'POST') {
    morgan.token('body', (req, res) => req.body)
    return [
      baseString,
      JSON.stringify(tokens.body(req, res))
    ].join(' ')
  } else {
    return baseString
  }
  
}))

app.get('/info', (req, res) => {
  const date = new Date()
  Contact.find({}).then(result => {
    const personString = (result.length === 1 ? "person" : "persons")
    res.send(`
      <p>Phonebook has info for ${result.length} ${personString}</p>
      <p>${date}</p>
    `)
  })
  
  
})

app.get('/api/persons', (req, res) => {
  Contact.find({}).then(result => {
    res.json(result)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Contact.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Contact.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const contact = {
    name: body.name,
    number: body.number,
  }

  Contact.findByIdAndUpdate(req.params.id, contact, { new: true })
    .then(updatedContact => {
      res.json(updatedContact)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  } 

  const contact = new Contact({
    name: body.name,
    number: body.number || "-"
  })

  contact.save()
    .then(savedContact => {
      res.json(savedContact)
    })
    .catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})