// Derived from https://codepen.io/sheikzm/pen/BeyXpz
function progressBar(progressVal, totalPercentageVal = 100) {
  var strokeVal = (4.65 * 100) /  totalPercentageVal;
  var front = document.querySelector('.progress-circle-front');
  front.style.strokeDasharray = progressVal * (strokeVal) + ' 999';
}

let percValue = document.querySelector('.percs-wrap')
let comment = percValue.childNodes[1].data
comment = comment.slice(13).trim()

progressBar(Number(comment),100);

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