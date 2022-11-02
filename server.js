const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const MakeClosedUrlsArr = require('./githubAuth')
const FetchClosedPrs = require('./apiFetch')
const ClosedParser = require('./closedPrParse')

const server = express()
const port = 3000

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.urlencoded({ extended: true })) 

server.get('/', (req, res) => {
})

server.post('/', async (req, res) => {
  const closedUrls = await MakeClosedUrlsArr(req.body.url)
  const closedPrData = await FetchClosedPrs(closedUrls)
  const allReviewersPrs = ClosedParser(closedPrData, closedUrls) 
  console.log('%' + allReviewersPrs)
  res.end()
})

server.listen(port, async () => {
  console.log(`server listening on port ${port}`)
})