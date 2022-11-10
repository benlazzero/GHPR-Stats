
const submitHandler = () => {
  let form = document.getElementById("form")      
  let spin = document.getElementById("spin")      
  form.style.display = "none"
  spin.style.display = "unset"
}

document.getElementById("sub-btn").addEventListener("click", submitHandler);