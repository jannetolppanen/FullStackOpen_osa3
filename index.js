const express = require('express')
const app = express()

let notes = [
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

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</>')
})

app.get('/api/persons', (req, res) => {
    res.json(notes)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on ${PORT}`)