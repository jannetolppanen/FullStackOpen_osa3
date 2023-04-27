const express = require('express')
const app = express()

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Emma Johnson',
        number: '050-987654'
    },
    {
        id: 3,
        name: 'Juan Martinez',
        number: '555-5555'
    },
    {
        id: 4,
        name: 'Aya Nakamura',
        number: '123-456-7890'
    }
]

const phonebookInfo = `<p>Phonebook has info for ${persons.length} people</p>`
const showCurrentTime = () => {
    const now = new Date();
    const dateString = `${now.toString()}`;
    return `<p>${dateString}</p>`
}

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</>')
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }

})

app.get('/info', (req, res) => {
    res.send(phonebookInfo + showCurrentTime())
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on ${PORT}`)