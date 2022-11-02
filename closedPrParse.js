

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
 */
const GetReviewersNames = (allReviewersArr) => {
  const allReviewers = allReviewersArr
  let allRevUsernames = []
  for (let i = 0; i < allReviewers.length; i++) {
    const username = allReviewers[i].login
    let ifNameExists = allRevUsernames.includes(username)
    if (ifNameExists == false) {
      allRevUsernames.push(username) 
    }
  }
  return allRevUsernames
}



const ClosedParser = (closedPrArr) => {
  const mergedPrsArr = RemoveUnmergedPrs(closedPrArr)  
  const allReviewersArr = GetReviewerObjects(mergedPrsArr)
  const allRevUsernamesArr = GetReviewersNames(allReviewersArr)
  return allRevUsernamesArr
}

module.exports = ClosedParser