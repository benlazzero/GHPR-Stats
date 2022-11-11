
const submitHandler = () => {
  let form = document.getElementById("form")      
  let spin = document.getElementById("spin")      
  let spinDesc = document.getElementById("spin-desc")      
  form.style.display = "none"
  spin.style.display = "unset"
  spinDesc.style.display = "unset"
}

document.getElementById("sub-btn").addEventListener("click", submitHandler);