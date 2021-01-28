/*
 * Poll Plugin, Reveal.js
 *
 * By Johannes Schildgen, 2020
 * https://github.com/jschildgen/reveal.js-poll-plugin
 *
 * Modified by Bastien DIDIER, data.bingo 2021
 * Remove jquery, bug fixes and minor changes
 *
 * Updated : Jan 28, 2021
 *
 */

let Poll = (function(){

    let currentPoll = null;
    let refreshInterval = null;

    Reveal.addEventListener('fragmentshown', function(event){
        if(event.fragment.classList.contains('result')){ stop(); }
        if(!event.fragment.classList.contains('poll')){ return; }
        currentPoll = event.fragment;
        start();
    });

    function start() {

        if(currentPoll.dataset.pollStatus == "finish"){ return; } //poll already finish

        let data = {
            question: currentPoll.dataset.pollQuestion,
            answers: new Array(),
            correct_answers: new Array()
        };

        let answersEl = currentPoll.querySelectorAll('ul > li > .poll-answer-text');
        answersEl.forEach(el => {
            data.answers.push(el.innerHTML);
        });

        let correctAnswersEl = currentPoll.querySelectorAll('ul > li[data-poll="correct"] > .poll-answer-text');
        correctAnswersEl.forEach(el => {
            data.correct_answers.push(el.innerHTML);
        });

        fetch('../poll/api/?method=start_poll&data='+encodeURIComponent(JSON.stringify(data)), {method: 'POST'});

        refreshInterval = window.setInterval(votersCount, 1000);
    }
    
    function votersCount() {
        fetch('../poll/api/?method=status', {method: 'GET'}).then( response => {
            return response.json();
        }).then(data => {
            if(!('count' in data)) { return; } // no active poll
            currentPoll.querySelector('.votersCount').innerHTML = data.count == 0 ? "0" : data.count;
        });
    }

    function stop() { 
        if(currentPoll == null) { return; }
        clearInterval(refreshInterval);

        fetch('../poll/api/?method=stop_poll', {method: 'GET'}).then( response => {
            return response.json();
        }).then(data => {
            
            let total = 0;
            for(i in data.answers) {
                total += data.answers[i];
            }

            let percentageEl = currentPoll.querySelectorAll('ul > li > .poll-percentage');
            percentageEl.forEach((el,index) => {
                const percentage = (index.toString() in data.answers) ? 100*data.answers[i]/total : 0;
                el.style.width = percentage+"%";
            });
            
            let correctAnswersEl = currentPoll.querySelectorAll('ul > li[data-poll="correct"]');
            correctAnswersEl.forEach((el, index) => {
                correctAnswersEl[index].classList.add("correct");
            });

            currentPoll.dataset.pollStatus = "finish";
            currentPoll = null;
        });
    }

    return {
        init: function() {    
            if(window.location.search.match( /print-pdf/gi )) {
                /* don't show poll in print view */
                return;
            }

            let resultEl = document.querySelectorAll('.poll > .result');
            resultEl.forEach(el => {
                el.addEventListener("click", stop, false);
            });
            
            let answersEl = document.querySelectorAll('.poll > .responses > li');
            answersEl.forEach(el => {
                el.innerHTML = '<div class="poll-percentage"></div>'
                              +'<div class="poll-answer-text">'+el.innerHTML+'</div>'
            });
            
            let pollsEl = document.querySelectorAll('.poll');
            pollsEl.forEach(el => {
                el.innerHTML += '<p class="voters">Voter(s) : <span class="votersCount">0</span></p>';
                el.style.display = 'block';
            });
        }
    }
})();

Reveal.registerPlugin('poll',Poll);