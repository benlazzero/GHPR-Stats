const https = require('node:https')
require('dotenv').config()
// For githubs Api
const options = { headers: { 'User-Agent': process.env.GH_USERAGENT, 'Accept': 'application/vnd.github+json'} }

const getSinglePrPage = (url) => {
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

const getAllPrData = async (urlArr) => {
  let Urls = urlArr
  let totalLength = 0
  for (let i = 0; i < Urls.length; i++) {
    let PrLength = await getSinglePrPage(Urls[i])
    if (PrLength.length < 100) {
      totalLength += PrLength.length
      break 
    } else {
      totalLength += PrLength.length
    }
  }
  return totalLength
}



module.exports = getAllPrData