const https = require('node:https')
const url = require('node:url')

// add some validation incase bad url
const ValidateUrl = (usersUrl) => {
  const unvalidatedUrl = new URL(usersUrl)
  const paths = unvalidatedUrl.pathname.split('/')
  if (paths.length !== 3) {
    return []
  }
  return paths
}

const ValidateRepo = (user, repo) => {
  const repoUrl = 'https://github.com/' + user + '/' + repo
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

const getUrlArray = async (user, repo) => {
  const status = await ValidateRepo(user, repo)
  if (await status !== 200) {
    return 'issue with retriving repo, check user and name of repo.'
  } 

  let arrayOfUrls = []
  const href = 'https://api.github.com/repos'
  const  path = '/' + user + '/' + repo  
  const searchParams = '/pulls?state=closed&page='
  let urlWithoutPage = href + path + searchParams

  for (let i = 1; i < 6; i++) {
    arrayOfUrls.push(urlWithoutPage + i) 
  }

  return arrayOfUrls;
}

module.exports = ValidateUrl;