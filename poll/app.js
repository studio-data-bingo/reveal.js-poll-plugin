document.addEventListener("DOMContentLoaded", function() {
  get_poll();
});

currentQid = null;

function get_poll() {
  fetch('./api/?method=get_poll', {method: 'GET'}).then( response => {
    return response.json();
  }).then(data => {
    let questionEl = document.getElementById('question');
    let answersEl = document.getElementById('answers');
    if(!('question' in data)) { // no quiz active
      questionEl.innerHTML = 'Awaiting survey…';
      answersEl.style.display = 'none';
    } else if(currentQid == data.qid) { // current question
      return;
    } else { // new question
      currentQid = data.qid;
      questionEl.innerHTML = data.question;
      answersEl.innerHTML = '';
      for(i in data.answers) { 
        answersEl.innerHTML += '<button onClick="respond('+i+')" value="'+i+'">'+data.answers[i]+'</button>';
      }
      answersEl.style.display = 'block';    
    }
  });
}

function respond(aid) {
  let answersButtonEl = document.querySelectorAll('#answers > button');
  answersButtonEl.forEach(el => el.disabled = true);
  answersButtonEl[aid].classList.add('selected');
  fetch('./api/?method=respond&aid='+aid, {method: 'POST'})
}

window.setInterval(function(){
  get_poll();
}, 3000);