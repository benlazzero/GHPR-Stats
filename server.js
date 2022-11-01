const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const getPrLength = require('./fetch')
const valUrl = require('./githubAuth')

const server = express()
const port = 3000

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.urlencoded({ extended: true })) 

server.get('/', (req, res) => {
})

server.post('/', (req, res) => {
  console.log('req.body' + req.body)
  console.log(valUrl(req.body.url))
  res.end()
})

server.listen(port, async () => {
  console.log(`server listening on port ${port}`)
})