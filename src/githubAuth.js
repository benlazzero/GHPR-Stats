const https = require('node:https')

/**
 * minor validation checking that it's a url and 'possibly' a good github repo 
 * @param {string} userUrl - Github url from website's input
 */
const ParseUrlPaths = (userUrl) => {
  let unvalidatedUrl
  try {
    unvalidatedUrl = new URL(userUrl)
  } catch (e) {
    if (e) {
      return []
    }
  }

  const paths = unvalidatedUrl.pathname.split('/')
  if (paths.length !== 3) {
    return []
  }
  return paths
}

/**
 * Uses the username/repo from ParseUrlPaths to check if repo exists(doesnt 404) 
 * @param {array} pathArr - index[0] is empty, [1] is the username, and [2] is the repo name
 */
const ValidateRepo = (pathArr) => {
  const repoUrl = 'https://github.com/' + pathArr[1] + '/' + pathArr[2]
  return new Promise((resolve, reject) => {
    https.get(repoUrl, (request) => {
      request.on('data', ()=> {
        resolve(request.statusCode);
      })
    }).on('error', ()=> {reject()})
  }).catch(() => {
    return 'couldnt get repo info';
  })
}

/**
 * Returns an array of github api endpoints to get PR's(closed), returns (x) if bad url 
 * @param {string} userUrl - Github url from website's input
 * @param {string} userPullAmount - users max amount of pr's to analyze from websites input
 * @param {int} getOpenPr - to get closed or open pulls, 0 = closed and 1 = open
 // TODO: either make it return an open link arr or make a new function for it
 */
const makeUrlArray = async (userUrl, userPullAmount, getOpenPr) => {
  const pathArr = ParseUrlPaths(userUrl)
  const totalPrNum = Number(userPullAmount.slice(0, 1))
  const statusCode = await ValidateRepo(pathArr)
  if (await statusCode !== 200) {
    return []
  } 

  let arrayOfUrls = []
  const href = 'https://api.github.com/repos'
  const  path = '/' + pathArr[1] + '/' + pathArr[2]  
  let searchParams = '/pulls?state=closed&per_page=100&page='
  if (getOpenPr === 1) {
    searchParams = '/pulls?state=open&per_page=100&page=' 
  }
  let urlWithoutPage = href + path + searchParams
  for (let page = 1; page < totalPrNum+1; page++) {
    arrayOfUrls.push(urlWithoutPage + page) 
  }
  return arrayOfUrls;
}

exports.parseUrl = ParseUrlPaths;
exports.makeUrlArray = makeUrlArray;