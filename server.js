const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookie = require('cookie')
const MakeClosedUrlsArr = require('./githubAuth')
const FetchClosedPrs = require('./apiFetch')
const ClosedPr = require('./closedPr')

const server = express()
const port = 3000

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.urlencoded({ extended: true })) 

server.get('/results', (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  res.send(cookies.value +'%' + '<br>' + cookies.freq + '<br>' + cookies.names)
})

server.post('/', async (req, res) => {
  const closedUrls = await MakeClosedUrlsArr(await req.body.url)
  if (closedUrls.length === 0) {
    res.redirect('/')
    return
  }
  const closedPrData = await FetchClosedPrs(closedUrls)
  const newClosedPr = new ClosedPr(closedPrData, closedUrls, await req.body.logins)

  let freq = newClosedPr.getPrMergeFrequency()
  let pullPerc = newClosedPr.getReviewersPullPercent()
  let names = JSON.stringify(newClosedPr.getReviewersAvatars())
  let avg = newClosedPr.getAvgMergeTime()
  console.log(avg)

  const revPercent = cookie.serialize('value', pullPerc, {maxAge: 5});
  const revFreq = cookie.serialize('freq', freq, {maxAge: 5});
  const revNames = cookie.serialize('names', names, {maxAge: 5});

  res.setHeader('Set-Cookie', [revPercent, revFreq, revNames])
  res.redirect('/results')
})

server.listen(port, async () => {
  console.log(`server listening on port ${port}`)
})