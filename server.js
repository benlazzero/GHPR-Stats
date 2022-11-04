const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookie = require('cookie')
const MakeClosedUrlsArr = require('./githubAuth')
const FetchClosedPrs = require('./apiFetch')
const ClosedParser = require('./closedPrParse')

const server = express()
const port = 3000

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.urlencoded({ extended: true })) 

server.get('/results', (req, res) => {
  var cookies = cookie.parse(req.headers.cookie || '');
  console.log(cookies)
  res.send(cookies.value + 'this is the value')
})

server.post('/', async (req, res) => {
  const closedUrls = await MakeClosedUrlsArr(req.body.url)
  const closedPrData = await FetchClosedPrs(closedUrls)
  const allReviewersPrs = ClosedParser(closedPrData, closedUrls) 
  const cookieA = cookie.serialize('value', allReviewersPrs);
  const cookieB = cookie.serialize('rand', 'pizza');
  res.setHeader('Set-Cookie', cookieA)
  res.setHeader('Set-Cookie', cookieB)
  res.redirect('/results')
})

server.listen(port, async () => {
  console.log(`server listening on port ${port}`)
})