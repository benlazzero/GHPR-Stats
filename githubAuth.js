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
 */
const makeUrlArray = async (userUrl) => {
  const pathArr = ParseUrlPaths(userUrl)
  const statusCode = await ValidateRepo(pathArr)
  if (await statusCode !== 200) {
    return []
  } 

  let arrayOfUrls = []
  const href = 'https://api.github.com/repos'
  const  path = '/' + pathArr[1] + '/' + pathArr[2]  
  const searchParams = '/pulls?state=closed&per_page=100&page='
  let urlWithoutPage = href + path + searchParams
  for (let i = 1; i < 6; i++) {
    arrayOfUrls.push(urlWithoutPage + i) 
  }
  return arrayOfUrls;
}

module.exports = makeUrlArray;