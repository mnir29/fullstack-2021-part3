const express = require('express')
const morgan = require('morgan')
const app = express()

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"   
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "39-44-5323523"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

const generateID = () => {
  return Math.floor(Math.random() * 1000000)
}

app.use(express.json())
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
  const personString = (persons.length === 1 ? "person" : "persons")
  res.send(`
    <p>Phonebook has info for ${persons.length} ${personString}</p>
    <p>${date}</p>
  `)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  console.log(person)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body
  
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  } else {
    const foundPerson = persons.find(person => person.name === body.name)
    if (foundPerson) {
      return res.status(400).json({
        error: 'name must be unique'
      })
    }
  }

  const person = {
    name: body.name,
    number: body.number || "-",
    id: generateID()
  }

  persons = persons.concat(person)

  res.json(person)

})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})