const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookie = require('cookie')
const { makeUrlArray, parseUrl } = require('./githubAuth')
const FetchPrs = require('./apiFetch')
const ClosedPr = require('./closedPr')
const OpenPr = require('./openPr')
const fs = require('node:fs')
const https = require('https')
const http = require('http')

const serverHttp = express()
const server = express()
const port = 443

server.use(express.static(path.join(__dirname, '../public')));
server.use(bodyParser.urlencoded({ extended: true })) 

serverHttp.get('*', (req, res) => {
  res.redirect('https://codecafeteria.com')
})

server.get('/results/:owner/:repo', async (req, res) => {
  /*
  cookies.value + cookies.freq + cookies.names + cookies.avg + 
  cookies.avgWk + cookies.total + cookies.oldest + cookies.newest
  */

  let cookies = cookie.parse(req.headers.cookie || '');

  // catch api limit response
  if (cookies.hasOwnProperty("avg") === false) {
    res.redirect('/')
    return
  }

  fs.readFile('/home/ben/GHPR-Stats/public/results.html', 'utf8', ((err, data) => {
    if (Object.keys(cookies).length < 3) {
      res.redirect('/')
      return
    }

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
       after = finalHtml.slice(maintList + 234)
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
    
    let avgValue = cookies.value
    let percentIndex = finalHtml.search("t-auth\">")
    before = finalHtml.slice(0, percentIndex+8)
    after = finalHtml.slice(percentIndex+8)
    finalHtml = before + avgValue + "%" + after
    let keyIndex = finalHtml.search("-->")
    before = finalHtml.slice(0, keyIndex-1) 
    let firstKey = '--><div class="authors"><div class="key-one"></div><span>Maintainers'
    let secondKey = '</span></div><div class="authors"><div class="key-two"></div><span>Others'
    let thirdKey = '</span></div>'
    after = finalHtml.slice(keyIndex+4)
    finalHtml = before + avgValue + firstKey + secondKey + thirdKey + after
    
    // freq graph set width based on keys
    let freqIndex = finalHtml.search("dth: ")
    let width = 350
    if (cookies.freq !== undefined) {
      totalKeys = Object.keys(JSON.parse(cookies.freq).merges).length
      if (totalKeys > 11) {
        width = ((totalKeys - 7) * 100) + 370 
      }
    }

    before = finalHtml.slice(0, freqIndex+4)
    after = finalHtml.slice(freqIndex+8) 
    finalHtml = before + " " + width.toString() + after
    
    // freq graph get heights, set left, insert child nodes
    let dataIndex = finalHtml.search("<hr><hr><hr><hr>")
    before = finalHtml.slice(0, dataIndex+16)
    after = finalHtml.slice(dataIndex+16)
    
    if (cookies.freq !== undefined) {
      let freqKeys = Object.keys(JSON.parse(cookies.freq).merges)
      let mergeObj = JSON.parse(cookies.freq).merges
      let upperBound = 0
      let lowerBound = 500
      for (let i = 0; i < freqKeys.length; i++) {
        let tempValue = mergeObj[freqKeys[i]]
        if (tempValue < lowerBound) {
          lowerBound = tempValue
        } 
        if (tempValue > upperBound) {
          upperBound = tempValue
        }
      }
      
      let normalizedData = []
      for (let i = 0; i < freqKeys.length; i++) {
        let tempValue = mergeObj[freqKeys[i]]
        let normal = (tempValue - lowerBound) / upperBound
        normalizedData.push(normal.toFixed(2))
      }
      
      let heights = []
      for (let i = 0; i < normalizedData.length; i++) {
        let tempHeight = normalizedData[i] 
        let pixelsToAdd = (80 * tempHeight) + 30
        heights.push(Math.floor(pixelsToAdd))
      }
      
      // put it all together for render
      let leftAmount = 15
      let dataHtmlString = ""
      let height = '<div class="data-point" style="height: '
      let left = 'px;left: '
      let beforePTag = 'px">'

      for (let i = 0; i < heights.length; i ++) {
        let tempHeight = heights[i]
        let leftPixels = leftAmount
        let mergeAmount = mergeObj[freqKeys[i]]
        let dayOfTotal = freqKeys[i]
        if (dayOfTotal < 10) {
          dayOfTotal = '0' + dayOfTotal
        }
        
        let clientNumbers = "<p>" + mergeAmount + "</p><p>" + dayOfTotal + "</p></div>"
        dataHtmlString += height + tempHeight + left + leftPixels + beforePTag + clientNumbers
        leftAmount += 50 
      }
      finalHtml = before + dataHtmlString + after

      // set top info for merge frequency card
      let freqObject = JSON.parse(cookies.freq)
      
      let mergeDaysHtml = "<p>" + freqObject.totalDays + " Total days</p>" 
      let totalDatesHtml = '<p class="freq-total">' + freqObject.totalMerges + " Merge dates </p>" 
      let mergeCardDate = '<p class="freq-dates">from ' + freqObject.oldest + " - " + freqObject.newest + "</p>"  
      
      let freqInfoIndex = finalHtml.search("ncy</h3>")
      before = finalHtml.slice(0, freqInfoIndex+8)
      after = finalHtml.slice(freqInfoIndex+8)
      finalHtml = before + mergeDaysHtml + totalDatesHtml + mergeCardDate + after
    }
    
    // insert repo name
    // req.params.repo and .owner
    let repoIndex = finalHtml.search("ies</h3>")
    before = finalHtml.slice(0, repoIndex+8)
    let repoInfo = "<p>Repository: " + req.params.repo + "</p><p>Owner: " + req.params.owner + "</p>"
    after = finalHtml.slice(repoIndex+8)
    finalHtml = before + repoInfo + after
    
    // add repos url to the github link
    let urlIndex = finalHtml.search("\"\">Github")
    before = finalHtml.slice(0, urlIndex+1)
    after = finalHtml.slice(urlIndex+1)
    
    finalHtml = before + cookies.url + after
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
  const url = cookie.serialize('url', req.body.url, {maxAge: 5});
  
  res.setHeader('Set-Cookie', [percent, freq, names, avg, avgWk, total, oldest, newest, url])
  const repoName = parseUrl(req.body.url)
  res.redirect('/results/' + repoName[1] + '/' + repoName[2])
})

server.get('*', function(req, res){
  res.redirect('/');
});

const sslServer = https.createServer(
	{
		key: fs.readFileSync(path.join(__dirname, '../ssl', 'privkey.pem')),
		cert: fs.readFileSync(path.join(__dirname, '../ssl', 'cert.pem')),
	},
	server
)

serverHttp.listen(80, () => {
  console.log('http serv')
})

sslServer.listen(port, () => {
  console.log(`server listening on port ${port}`)
})
