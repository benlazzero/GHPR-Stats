const https = require('node:https')
require('dotenv').config()
// Header for github's api and recommended 'accept' header per api documentation
const options = { headers: { 'User-Agent': process.env.GH_AUTH, 'Accept': 'application/vnd.github+json'} }

/**
 * Nodejs fetch that returns data from a url, uses http library 
 * @param {string} url - url from array of urls made from users input in githubAuth.js
 */
const GetSinglePrPage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, options, (request) => {
      let PRData = ''
      
      request.on('data', (chunk)=> {
        PRData += chunk
      })

      request.on('end', () => {
        let allPrData = JSON.parse(PRData)
        resolve(allPrData)
      })
      
    }).on('error', ()=> {reject()})
  }).catch((err) => {
    return err
  })
}

/**
 * Uses getSinglePrPage() to return each PR in an array of json objects 
 * @param {array} urlArr - An array of urls/endpoints to use with the gh api to get pr data
 */
const GetAllPrData = async (urlArr) => {
  let Urls = urlArr
  let totalLength = 0
  let allPrs = []
  for (let i = 0; i < Urls.length; i++) {
    let prRequest = await GetSinglePrPage(Urls[i])
    if (prRequest.length < 100) {
      totalLength += prRequest.length
      allPrs.push(prRequest)
      break 
    } else {
      totalLength += prRequest.length
      allPrs.push(prRequest)
    }
  }
  return allPrs.flat(2)
}


module.exports = GetAllPrData