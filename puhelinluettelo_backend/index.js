const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
require('dotenv').config()
const Person = require('./models/person')

// Käyttöön json-parser. Ilman tätä postia tehdessä request.body olisi undefined
app.use(express.json())

app.use(cors())

// Tarkastaa build kansion juuressa ja tarjoaa pyydetyn tiedoston sieltä, jos sieltä sen niminen tiedosto löytyy
app.use(express.static('build'))

// /info page
const showCurrentTime = () => {
    const now = new Date()
    const dateString = `${now.toString()}`
    return `<p>${dateString}</p>`
}

// Virheenkäsittely middleware
const errorHandler = (error, request, response, next) => {
    console.log('$ Error handler called $ ')
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error : 'Name needs to atleast 3 letters. Number needs to be atleast 8 digits and start with 2 or 3 digits followed by - symbol' })
    }
    next(error)
}

// this is logged everytime app is used
app.use(morgan('tiny'))

// custom morgan token to show name and number json
morgan.token('req-body', (req) => {
    const output = {
        name: req.body.name,
        number: req.body.number
    }
    return JSON.stringify(output)
})

// used in app.post
const morganOutput = morgan(':method :url :status :response-time ms :res[content-length] :req-body')

app.post('/api/persons', morganOutput, (request, response, next) => {
    // const body = request.body
    const { name, number } = request.body

    const person = new Person(
        { name, number }
    )

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => {
            next(error)
        })
})

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</>')
})

// if-else tarkastaa onko oikean tyyppinen id olemassa ja herjaa jos oikeanlainen id on annettu mutta sitä ei löydy.
// .catch toimii vasta jos annetaan kokonaan vääräntyyppinen id
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => {
            response.send(`<p>Phonebook has info for ${count} people</p>` + showCurrentTime())
        })
        .catch(error => next(error))
})

app.get('/api/persons', (request, result, next) => {
    Person.find({}).then(persons => {
        result.json(persons)
    })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
// Otetaan käyttöön virheenkäsittely middleware
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on ${PORT}`)