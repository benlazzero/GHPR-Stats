// Derived from https://codepen.io/sheikzm/pen/BeyXpz
function progressBar(progressVal) {
  let percent = progressVal / 100
  var strokeVal = percent * 534;
  var front = document.querySelector('.progress-circle-front');
  front.style.strokeDasharray = Math.floor(strokeVal) + ' 999';
}

let percValue = document.querySelector('.percs-wrap')
let comment = percValue.childNodes[1].data
comment = comment.slice(13).trim()

progressBar(Number(comment));

// window width for freq graph
const hrTags = document.getElementsByTagName("hr")
const baseWidth = hrTags[0].offsetWidth

if (window.innerWidth >= 701 && hrTags[0].offsetWidth === baseWidth) {
  for (let i = 0; i < 4; i++) {
    hrTags[i].style.width = baseWidth-327 + 'px'
  }
}

function reportWindowSize() {
  let hrDynamic = document.getElementsByTagName("hr")
  if (window.innerWidth >= 701 && hrDynamic[0].offsetWidth === baseWidth) {
    for (let i = 0; i < 4; i++) {
      hrTags[i].style.width = baseWidth-327 + 'px'
    }
  }
  
  if (window.innerWidth < 701 && hrDynamic[0].offsetWidth !== baseWidth) {
    for (let i = 0; i < 4; i++) {
      hrTags[i].style.width = baseWidth + 'px'
    }
  }
}

window.onresize = reportWindowSize;

// positioning the percent in circle graph
function positionPercent() {
  let percentElm = document.getElementsByClassName("percent-auth")
  let length = percentElm[0].outerText.length
  if (length === 2) {
    percentElm[0].style.left = "92px"
  } else if (length === 3) {
    percentElm[0].style.left = "76px"
  } else {
    percentElm[0].style.left = "62px"
  }
}

positionPercent()