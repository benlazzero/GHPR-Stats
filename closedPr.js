class ClosedPr {
  constructor(prArr, urlArr, userAdmins) {
    this.userAdmins = this.#parseLogins(userAdmins)
    this.urls = urlArr
    this.pulls = prArr
    this.repoOwner = this.#getOwnerUsername()
    this.mergedPulls = this.#getMergedPulls()
    this.mergeDates = this.#getPrMergeDates()
    this.adminsJson = this.#getAdminObjects()
    this.adminNames = this.#getReviewersNames()
  }
  
  /**
   * Uses user input from the form to return an array of usernames of reviewers
   * @param {string} userAdmins - The string from form input for adding reviewers to search for
   */
  #parseLogins = (userAdmins) => {
    const usernames = userAdmins
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
  
  // Uses the url array to return the username for the repo 
  #getOwnerUsername = () => {
    const repoUrl = new URL(this.urls[0])
    let paths = repoUrl.pathname.split('/')
    return paths[2]
  }
  
  // takes in the array of all the prs and returns the array with all closed&unmerged removed 
  #getMergedPulls = () => {
    let allPrs = this.pulls
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
  
  // takes in the merged Prs and returns an array of all the dates of each merge
  #getPrMergeDates = () => {
    let mergedPrs = this.mergedPulls
    let allDates = []
    for (let i = 0; i < mergedPrs.length; i++) {
      const date = mergedPrs[i].merged_at.slice(0, 10)
      allDates.push(date) 
    }
    return allDates
  }

  // takes in arr of prs that have been merged, returns names of all reviewers
  #getAdminObjects = () => {
    let allPrs = this.mergedPulls
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
  
  // Takes in array of reviewers objects, repo owner, user admin input and returns all unique reviewers usernames
  #getReviewersNames = () => {
    const allReviewers = this.adminsJson
    const allExtras = this.userAdmins
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

    if (allRevUsernames.includes(this.repoOwner) === false) {
      allRevUsernames.push(this.repoOwner)
    }

    return allRevUsernames
  }
  
  // uses array of admins usernames to grab avatar links from merged pulls
  getReviewersAvatars = () => {
    const adminNames = this.adminNames 
    const mergedPulls = this.mergedPulls
    let pushedAdmins = []
    let adminAvatars = {}
    
    for (let i = 0; i < mergedPulls.length; i++) {
      let name = mergedPulls[i].user.login
      let nameIncluded = adminNames.includes(name)
      let isPushed = pushedAdmins.includes(name)
      if (nameIncluded && !isPushed) {
        adminAvatars[name] = mergedPulls[i].user.avatar_url
        pushedAdmins.push(name)
      }
      
      if (adminNames.length === pushedAdmins.length) {
        return adminAvatars
      }
    }
    
    return adminAvatars
  }

  // takes in merged prs and returns the average amount of days it took for them to merge
  getAvgMergeTime = () => {
    const mergedPulls = this.mergedPulls
    let samples = [] 
    let total = 0

    for (let i = 0; i < mergedPulls.length; i++) {
      let created = new Date(mergedPulls[i].created_at)
      let merged = new Date(mergedPulls[i].merged_at)
      let diff = Math.round((created - merged) / (1000 * 60 * 60 * 24))
      samples.push(Math.abs(diff))
    }

    for (let i = 0; i < samples.length; i++) {
      total += samples[i]
    }

    return Math.round(total / samples.length)
  }
  
  // takes in an array of dates from merged prs and returns an object of key/value {date: how-many-merges}
  getPrMergeFrequency = () => {
    let mergeDates = this.mergeDates 
    let frequencyObj = {}
    for (let i = 0; i < mergeDates.length; i++) {
      let date = mergeDates[i]
      let doesExist = frequencyObj.hasOwnProperty(date)
      if (doesExist) {
        frequencyObj[date] = frequencyObj[date] + 1
      } else {
        frequencyObj[date] = 1
      }
    }
    return JSON.stringify(frequencyObj)
  }

  // Uses the array of all PRs and array of Names to return the number of PRs that are from reviewers
  getReviewersPullPercent = () => {
    const mergedPrs = this.mergedPulls
    const allNamesArr = this.#getReviewersNames()
    let totalRevsPrs = 0
    for (let i = 0; i < mergedPrs.length; i++) {
      let username = mergedPrs[i].user.login 
      if (allNamesArr.includes(username)) {
        totalRevsPrs += 1
      }
    }
    return (Math.round((totalRevsPrs / mergedPrs.length) * 100))
  }
}

module.exports = ClosedPr