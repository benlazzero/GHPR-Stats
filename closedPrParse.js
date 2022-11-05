/**
 * Uses user input from the form to return an array of usernames of reviewers
 * @param {string} logins - The string from form input for adding reviewers to search for
 */
const parseLogins = (logins) => {
  const usernames = logins
  if (usernames.length > 100 || usernames.length == 0) {
    return ''
  }
  const noSpaces = usernames.replace(/\s/g, '')
  const arrOfUsernames = noSpaces.split(',')
  for (let i = 0; i < arrOfUsernames.length; i++) {
    if (arrOfUsernames[i].length > 39) {
      arrOfUsernames.splice(i, 1)
    } 
  }
  return arrOfUsernames
}

/**
 * Uses the url array to return the username for the repo 
 * @param {array} urls - An array of urls that point to the github PR endpoints
 */
const GetOwnerUsername = (urls) => {
  const repoUrl = new URL(urls[0])
  let paths = repoUrl.pathname.split('/')
  return paths[2]
}

/**
 * takes in the array of all the prs and returns the array with all closed&unmerged removed 
 * @param {array} closedPrArr - An array of pr json objects from github api
 */
const RemoveUnmergedPrs = (closedPrArr) => {
  let allPrs = closedPrArr
  let allMergedPrs = []
  for (let i = 0; i < allPrs.length; i++) {
    const mergeDate = allPrs[i].merged_at
    if (mergeDate === null) {
      allPrs.splice(i, 1)
      i--
    } else {
      allMergedPrs.push(allPrs[i])
    }
  }

  return allMergedPrs
}

/**
 * takes in arr of prs that have been merged, returns names of all reviewers
 * @param {array} mergedPrsArr - An array of all prs from repo that have been merged
 */
const GetReviewerObjects = (mergedPrsArr) => {
  let allPrs = mergedPrsArr
  let allReviewers = []
  for (let i = 0; i < allPrs.length; i++) {
    let assignee = allPrs[i].assignee
    let assignees = allPrs[i].assignees
    let reviewers = allPrs[i].requested_reviewers
    let teams = allPrs[i].requested_teams 
    
    if (assignee !== null) {
      allReviewers.push([assignee])
    }
    if (assignees.length !== 0) {
      allReviewers.push(assignees)
    }
    if (reviewers.length !== 0) {
      allReviewers.push(reviewers)
    }
    if (teams.length !== 0) {
      allReviewers.push(teams)
    }
  }
  return allReviewers.flat()
}

/**
 * Takes in array of reviewers objects and returns all unique reviewers usernames
 * @param {array} allReviewersArr - An array of all reviewers/etc. 
 * @param {string} owner - String of the repo's owners username  
 * @param {array} extrasArr - An array of strings of all extra reviewers usernames from form input 
 */
const GetReviewersNames = (allReviewersArr, owner, extrasArr) => {
  const allReviewers = allReviewersArr
  const allExtras = extrasArr
  let allRevUsernames = []
  for (let i = 0; i < allReviewers.length; i++) {
    const username = allReviewers[i].login
    let nameExists = allRevUsernames.includes(username)
    if (nameExists == false) {
      allRevUsernames.push(username) 
    }
  }
  
  for (let i = 0; i < allExtras.length; i++) {
    const username = allExtras[i] 
    let nameExists = allRevUsernames.includes(username)
    if (nameExists == false) {
      allRevUsernames.push(username)
    } 
  }

  if (allRevUsernames.includes(owner) === false) {
    allRevUsernames.push(owner)
  }
  
  return allRevUsernames
}

/**
 * Uses the array of all PRs and array of Names to return the number of PRs that are from reviewers
 * @param {array} revNamesArr - An array of all the usernames of reviewers
 * @param {array} mergedPrsArr - An array of all the PRs that have been merged
 */
const CountReviewersPrs = (revNamesArr, mergedPrsArr) => {
  const allPrs = mergedPrsArr
  const allNamesArr = revNamesArr
  let totalRevsPrs = 0
  for (let i = 0; i < allPrs.length; i++) {
    let username = allPrs[i].user.login 
    if (allNamesArr.includes(username)) {
      totalRevsPrs += 1
    }
  }
  return totalRevsPrs
}


const ClosedParser = (closedPrArr, urls, logins) => {
  const extraReviewers = parseLogins(logins) 
  const ownerUsername = GetOwnerUsername(urls)
  const mergedPrsArr = RemoveUnmergedPrs(closedPrArr)  
  const allReviewersArr = GetReviewerObjects(mergedPrsArr)
  const allRevUsernamesArr = GetReviewersNames(allReviewersArr, ownerUsername, extraReviewers)
  const totalRevsPrs = CountReviewersPrs(allRevUsernamesArr, mergedPrsArr)
  return Math.round((totalRevsPrs / mergedPrsArr.length) * 100)
}

module.exports = ClosedParser