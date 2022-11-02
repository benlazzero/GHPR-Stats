const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const urlArray = require('./githubAuth')
const fetchPrs = require('./apiFetch')

const server = express()
const port = 3000

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.urlencoded({ extended: true })) 

server.get('/', (req, res) => {
})

server.post('/', async (req, res) => {
  const repoUrls = await urlArray(req.body.url)
  const prData = await fetchPrs(repoUrls)
  console.log(prData)
  res.end()
})

server.listen(port, async () => {
  console.log(`server listening on port ${port}`)
})