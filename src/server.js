const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookie = require('cookie')
const { makeUrlArray, parseUrl } = require('./githubAuth')
const FetchPrs = require('./apiFetch')
const ClosedPr = require('./closedPr')
const OpenPr = require('./openPr')
const fs = require('node:fs')

const server = express()
const port = 3000

server.use(express.static(path.join(__dirname, '../public')));
server.use(bodyParser.urlencoded({ extended: true })) 

server.get('/results/:repo', async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  /*
  res.send(cookies.value +'%' + '<br>' + cookies.freq + '<br>' + cookies.names + '<br>' + 
  'days: ' + cookies.avg + '<br>' + 'avg weekly: ' + cookies.avgWk + 
  '/total open: ' + cookies.total + '/oldest pr: ' + cookies.oldest + '/newest pr: ' + cookies.newest)
  */
  fs.readFile('/Users/benlazzeroni/projects/ghprstats/new/GHPR-Stats/public/results.html', 'utf8', ((err, data) => {
    console.log(req.params.repo) // repos name

    let valueIndex = data.search("ue\"")
    let before = data.slice(0, valueIndex+4)
    let after = data.slice(valueIndex+4)
    let finalHtml = before + cookies.avg + after
    
    let weeklyIndex = finalHtml.search("ly\"")
    before = finalHtml.slice(0, weeklyIndex+4)
    after = finalHtml.slice(weeklyIndex+4)
    finalHtml = before + cookies.avgWk + after
    
    let totalOpenIndex = finalHtml.search("bv\"")
    before = finalHtml.slice(0, totalOpenIndex+4)
    after = finalHtml.slice(totalOpenIndex+4)
    finalHtml = before + cookies.total + after
    
    let newestDate = finalHtml.search("mv\"")
    before = finalHtml.slice(0, newestDate+4)
    after = finalHtml.slice(newestDate+4)
    finalHtml = before + cookies.newest + after

    let oldestDate = finalHtml.search("sv\"") 
    before = finalHtml.slice(0, oldestDate+4)
    after = finalHtml.slice(oldestDate+4)
    finalHtml = before + cookies.oldest + after
    
    if (cookies.names !== undefined) {
      if (cookies.names.length > 3) {
       let allNames = JSON.parse(cookies.names) 
       let allKeys = Object.keys(allNames)
       
       let maintList = finalHtml.search("maint-l")
       before = finalHtml.slice(0, maintList + 12)
       after = finalHtml.slice(maintList + 230)
       let template = finalHtml.slice(maintList + 12, maintList + 230)
       let allMaints = ""
       
       for (let i = 0; i < allKeys.length; i++) {
         let start = '<div class="maint-one"><img src="'
         let middle = '" alt="users profile picture"><h3>'
         let final = '</h3></div>'
         let temp = start + allNames[allKeys[i]] + middle + allKeys[i] + final
         allMaints = allMaints + temp
       }
       
       finalHtml = before + allMaints + after
      }
    }

    res.send(finalHtml)
  }))
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