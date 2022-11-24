// check for cookies

let isCookie = (() => {
  document.cookie = "test=test"
  let dCookie = decodeURIComponent(document.cookie)
  if (dCookie === "test=test") {
    document.cookie = "test=test; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    return
  }
  // please enable cookies logic
  let button = document.getElementById("sub-btn")
  let flash = document.getElementById("flash-bad")
  button.disabled = true;
  flash.innerText = 'Please enable cookies to proceed'
  flash.style.display = 'block'
})()


// form submit animation 
const submitHandler = (event) => {
  let input = document.getElementsByClassName("repo-search")[0]
  
  if (input.value.search("https://github.com/") == -1 ) {
    event.preventDefault()
    document.getElementById("flash-bad").style.display = "block"
    return
  }

  let main = document.getElementById("main")      
  let header = document.querySelector(".index-header")      
  let body = document.getElementById("body-elm")
  let spinDesc = document.getElementById("spin-desc")      
  let desc = document.getElementById("desc")      
  let desc2 = document.getElementById("desc2")      
  let footer = document.querySelector(".footer")
  header.style.display = "none"
  footer.style.display = "none"
  main.style.display = "none"
  spinDesc.style.display = "block"
  body.classList.add("bg-easein") 
  setTimeout(() => {
    body.classList.remove("bg-easein")
    body.classList.add("bg-anime")
  }, 3000)
  setTimeout(() => {
    spinDesc.style.display = "none"
    desc.style.display = "block"
  }, 6000)
  setTimeout(() => {
    desc.style.display = "none"
    desc2.style.display = "block"
  }, 13000)
}

document.getElementById("sub-btn").addEventListener("click", submitHandler);
