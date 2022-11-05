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
  const cookies = cookie.parse(req.headers.cookie || '');
  res.send(cookies.value + '% --- this is the value')
})

server.post('/', async (req, res) => {
  const closedUrls = await MakeClosedUrlsArr(await req.body.url)
  if (closedUrls.length === 0) {
    res.redirect('/')
    res.end()
    return
  }
  const closedPrData = await FetchClosedPrs(closedUrls)
  const allReviewersPrs = ClosedParser(closedPrData, closedUrls, await req.body.logins) 
  const revPercent = cookie.serialize('value', allReviewersPrs, { maxAge: 5 });
  res.setHeader('Set-Cookie', revPercent)
  res.redirect('/results')
})

server.listen(port, async () => {
  console.log(`server listening on port ${port}`)
})