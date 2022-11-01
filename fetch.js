const https = require('node:https')
const getUrlArray = require('./githubAuth')
const options = { headers: { 'User-Agent': 'benlazzero', 'Accept': 'application/vnd.github+json'} }

const getSinglePrPage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, options, (request) => {
      let PRData = ''
      
      request.on('data', (chunk)=> {
        PRData += chunk
      })

      request.on('end', () => {
        let prdata = JSON.parse(PRData)
        resolve(prdata)
      })
      
    }).on('error', ()=> {reject()})
  }).catch((err) => {
    return err
  })
}

const getAllPrData = async () => {
  let Urls = await getUrlArray('ethereum', 'ethereum-org-website')
  let totalLength = 0
  for (let i = 0; i < Urls.length; i++) {
    let PrLength = await getSinglePrPage(Urls[i])
    console.log(PrLength[0].requested_reviewers[0].login)
    if (await PrLength < 30) {
      totalLength += PrLength
      break 
    } else {
      totalLength += PrLength
    }
  }
  return totalLength
}



module.exports = getAllPrData