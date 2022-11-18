
const submitHandler = () => {
  let main = document.getElementById("main")      
  let header = document.querySelector(".index-header")      
  let body = document.getElementById("body-elm")
  let spinDesc = document.getElementById("spin-desc")      
  header.style.display = "none"
  main.style.display = "none"
  spinDesc.style.display = "unset"
  body.classList.add("bg-anime")
}

document.getElementById("sub-btn").addEventListener("click", submitHandler);