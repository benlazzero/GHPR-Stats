class OpenPr {
  constructor(prArr) {
    this.pulls = prArr
    this.noDraftPulls = this.#removeDrafts()
    this.totalPulls = this.#getTotalPulls()
    this.oldestPull = this.#getExtremePull(true)
    this.newestPull = this.#getExtremePull(false)
  }
  
  #removeDrafts = () => {
    let pulls = this.pulls  
    let noDrafts = []
    for (let i = 0; i < pulls.length; i++) {
      let draft = pulls[i].draft
      if (draft === true) {
        pulls.splice(i, 1)
        i--
      } else {
        noDrafts.push(pulls[i])
      }
    }
    return noDrafts
  }

  #getTotalPulls = () => {
    return this.noDraftPulls.length
  } 

  // isOld, if true then returns oldest pull and if false returns newest pull 
  #getExtremePull = (isOldBool) => {
    const pulls = this.noDraftPulls 
    const isOld = isOldBool 
    let tempDate = null 
    for (let i = 0; i < pulls.length; i++) {
      const pullDate = new Date(pulls[i].created_at)
      if (isOld) {
        if (pullDate < tempDate || tempDate === null) {
          tempDate = pullDate
        }
      } else {
        if (pullDate > tempDate || tempDate === null) {
          tempDate = pullDate
        }
      }
    }
    return tempDate
  }
  
  
  getAllStats = () => {
    let stats = {}
    stats.total = this.totalPulls
    stats.oldest = this.oldestPull
    stats.newest = this.newestPull
    return stats;
  }
}

module.exports = OpenPr