const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookie = require('cookie')
const { makeUrlArray, parseUrl } = require('./githubAuth')
const FetchPrs = require('./apiFetch')
const ClosedPr = require('./closedPr')
const OpenPr = require('./openPr')

const server = express()
const port = 3000

server.use(express.static(path.join(__dirname, '../public')));
server.use(bodyParser.urlencoded({ extended: true })) 

server.get('/results/:repo', (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  res.send(cookies.value +'%' + '<br>' + cookies.freq + '<br>' + cookies.names + '<br>' + 
  'days: ' + cookies.avg + '<br>' + 'avg weekly: ' + cookies.avgWk + 
  '/total open: ' + cookies.total + '/oldest pr: ' + cookies.oldest + '/newest pr: ' + cookies.newest)
})

server.post('/', async (req, res) => {
  const closedUrls = await makeUrlArray(await req.body.url, await req.body.sample, 0)
  if (closedUrls.length === 0) {
    res.redirect('/')
    return
  }
  const openUrls = await makeUrlArray(await req.body.url, await req.body.sample, 1)

  const openPrData = await FetchPrs(openUrls) 
  const closedPrData = await FetchPrs(closedUrls)

  const newClosedPr = new ClosedPr(closedPrData, closedUrls, await req.body.logins)
  const newOpenPr = new OpenPr(openPrData)
  
  let closed = newClosedPr.getAllStats()
  let open = newOpenPr.getAllStats()

  const percent = cookie.serialize('value', closed.pullPerc, {maxAge: 5});
  const freq = cookie.serialize('freq', closed.freq, {maxAge: 5});
  const names = cookie.serialize('names', closed.adminNames, {maxAge: 5});
  const avg = cookie.serialize('avg', closed.avgMrgTime, {maxAge: 5});
  const avgWk = cookie.serialize('avgWk', closed.avgWk, {maxAge: 5});
  const total = cookie.serialize('total', open.total, {maxAge: 5});
  const oldest = cookie.serialize('oldest', open.oldest, {maxAge: 5});
  const newest = cookie.serialize('newest', open.newest, {maxAge: 5});
  
  res.setHeader('Set-Cookie', [percent, freq, names, avg, avgWk, total, oldest, newest])
  const repoName = parseUrl(req.body.url)
  res.redirect('/results/' + repoName[2])
})

server.listen(port, async () => {
  console.log(`server listening on port ${port}`)
})