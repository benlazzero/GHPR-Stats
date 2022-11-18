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
