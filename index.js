const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

const HOST_PORT = process.env.PORT || 3001;
const MAX_RANGE_ID = 10000;
const MIN_RANGE_ID = 1;

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

// ---- Morgan config ----
morgan.token('body', (req, res) => { return JSON.stringify(req.body) });

function morganConfig(tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}

app.use(morgan(morganConfig));
// ---- End Morgan Config ----

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
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/info', (req, res) => {
  const personsNumber = persons.length;
  const requestDate = new Date();
  
  const info = `Phonebook has info for ${personsNumber} people <br /> ${requestDate}`;

  res.send(info);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const foundPerson = persons.find(p => p.id === id);

  if (!foundPerson) return res.status(404).end();

  res.send(foundPerson);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(200).send(persons);
});

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      'error': 'missing content'
    });
  }

  if (persons.find(p => p.name === body.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    });
  }

  const newPerson = {
    id: getRandomInt(MIN_RANGE_ID, MAX_RANGE_ID),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson);
  res.send(newPerson);
});

app.listen(HOST_PORT, () => console.log(`Server running on port ${HOST_PORT}`));
