// Ensure DOM is loaded for Hack Smasher game
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const start_sfx = new Audio('./css/start.mp3');
  const hit_sfx = new Audio('./css/hit.mp3');
  const hit2_sfx = new Audio('./css/hit2.mp3');
  const peep_sfx = new Audio('./css/peep.mp3');
  const ding_sfx = new Audio('./css/ding.mp3');
  const pam_sfx = new Audio('./css/pam.mp3');
  const pum_sfx = new Audio('./css/pum.mp3');
  const holes = document.querySelectorAll('.hole');
  const moles = document.querySelectorAll('.moles'); // Fixed to match HTML
  const counter = document.querySelector('.score span');
  const start = document.querySelector('.start');
  const retry = document.querySelector('.retry');
  const timer = document.querySelector('.time span');
  const velocityLevelDOM = document.querySelector('.velocity-level');
  const timeLevelDOM = document.querySelector('.time-level');
  const volumeLevelDOM = document.querySelector('.volume-level');
  let velocity_level = 1;
  let time_level = 1;
  let volume_level = 1;
  let count = 0;
  let lastHole;
  let timeUp = false;
  let started = false;

  const scoreboard = document.querySelector('.scoreboard');
  const nameContainer = document.querySelector('.enterName');
  const nameInput = document.querySelector('input[type=text]');
  const table = document.querySelector('.scores');
  let scoreboardTable = localStorage.getItem('scoreboard') ? JSON.parse(localStorage.getItem('scoreboard')) : [];
  let finalScore;
  let name;

  // Modal for Hack Smasher
  const modal = document.querySelector('.modal');
  console.log('External script loaded at:', new Date().toISOString(), 'Modal element:', modal); // Debug

  // Event Listeners
  modal.addEventListener('click', (e) => {
      console.log('Modal click event fired at:', new Date().toISOString(), 'Target class:', e.target.className); // Debug
      e.preventDefault();
      const selection = e.target.className;
      switch (selection) {
          case 'e':
              changeVelocityLevel(null, 3);
              changeTimeLevel(null, '5');
              break;
          case 'm':
              changeVelocityLevel(null, 1);
              changeTimeLevel(null, '30');
              break;
          case 'h':
              changeVelocityLevel(null, 2);
              changeTimeLevel(null, '10');
              break;
          default:
              return;
      }
      modal.classList.add('hide');
      if (volume_level) {
          start_sfx.currentTime = 0;
          start_sfx.play();
      }
      document.querySelector('.container').style.display = 'block'; // Show game
  });

  start.addEventListener('click', startTime);
  retry.addEventListener('click', goMenu);
  holes.forEach(hole => hole.addEventListener('mousedown', up));
  holes.forEach(hole => hole.addEventListener('touchstart', up));
  nameInput.addEventListener('keyup', enterName);
  velocityLevelDOM.addEventListener('click', changeVelocityLevel);
  timeLevelDOM.addEventListener('click', changeTimeLevel);
  volumeLevelDOM.addEventListener('click', changeVolumeLevel);

  // Functions
  function up(e) {
      e.preventDefault();
      if (this.classList.contains('up')) {
          this.classList.remove('up');
          if (volume_level) {
              const x = Math.round(Math.random() * (2 - 1) + 1);
              if (x === 1) {
                  hit_sfx.currentTime = 0;
                  hit_sfx.play();
              } else {
                  hit2_sfx.currentTime = 0.1;
                  hit2_sfx.play();
              }
          }
          count++;
          counter.textContent = `${count}`;
      }
  }

  function peep() {
      const randomTime = getRandomTime();
      const hole = randomHole(holes);
      hole.classList.add('up');
      if (volume_level) {
          peep_sfx.currentTime = 0;
          peep_sfx.play();
      }
      setTimeout(() => {
          if (!timeUp) peep();
          hole.classList.remove('up');
      }, randomTime);
  }

  function randomHole(holes) {
      const index = Math.floor(Math.random() * holes.length);
      const hole = holes[index];
      if (lastHole === hole) {
          return randomHole(holes);
      }
      lastHole = hole;
      return hole;
  }

  function startTime() {
      if (!started) {
          if (volume_level) {
              start_sfx.currentTime = 0.125;
              start_sfx.play();
          }
          counter.textContent = '0';
          count = 0;
          timeUp = false;
          let time = getTime(); // Local variable for countdown
          started = true;
          timer.textContent = `${time}`;
          peep();
          const countdown = setInterval(() => {
              time--;
              timer.textContent = `${time}`;
              if (time === 3 || time === 1) timer.style.color = '#f33';
              else timer.style.color = 'inherit';

              if (time <= 0) {
                  clearInterval(countdown);
                  timeUp = true;
                  started = false;
                  if (volume_level) {
                      ding_sfx.currentTime = 0;
                      ding_sfx.play();
                  }
                  setTimeout(() => {
                      scoreboardUpdater();
                  }, 1000);
              }
          }, 1000);
      }
  }

  function scoreboardUpdater() {
      finalScore = count;
      nameContainer.classList.add('flex');
      setTimeout(() => {
          nameContainer.classList.add('opacity');
      }, 100);
  }

  function enterName(e) {
      if (e.keyCode === 13) {
          name = this.value;
          this.value = '';
          nameContainer.classList.remove('flex');
          nameContainer.classList.remove('opacity');
          scoreboard.classList.add('block');
          scoreboard.classList.add('opacity');
          scoreboardTable.push({ name, score: finalScore });
          localStorage.setItem('scoreboard', JSON.stringify(scoreboardTable));
          const sortedScoreTable = scoreboardTable.sort((a, b) => (a.score > b.score ? -1 : 1));
          table.innerHTML = `
              <button class="score-button">X</button>
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Score</th>
                  </tr>
              </thead>`;
          for (let i = 0; i < sortedScoreTable.length && i < 8; i++) {
              table.innerHTML += `
                  <tr>
                      <td>${i + 1}</td>
                      <td>${sortedScoreTable[i].name}</td>
                      <td>${sortedScoreTable[i].score}</td>
                  </tr>`;
          }
          table.querySelector('.score-button').addEventListener('click', goMenu);
      }
  }

  function goMenu() {
      scoreboard.classList.remove('block');
      scoreboard.classList.remove('opacity');
      nameContainer.classList.remove('flex');
      nameContainer.classList.remove('opacity');
      modal.classList.remove('hide');
      document.querySelector('.container').style.display = 'none';
  }

  function getRandomTime() {
      switch (velocity_level) {
          case 0: return Math.round(Math.random() * (1500 - 600) + 600);
          case 1: return Math.round(Math.random() * (1500 - 400) + 400);
          case 2: return Math.round(Math.random() * (450 - 450) + 450);
          default: return Math.round(Math.random() * (1500 - 400) + 400);
      }
  }

  function getTime() {
      switch (time_level) {
          case 0: return 30;
          case 1: return 10;
          case 2: return 5;
          default: return 10;
      }
  }

  function changeVelocityLevel(e, n) {
      const element = velocityLevelDOM.children[1];
      const currentLevel = n || +element.textContent;
      if (volume_level) {
          start_sfx.currentTime = 0.125;
          start_sfx.play();
      }
      switch (currentLevel) {
          case 1:
              element.classList.remove('easy');
              element.classList.add('normal');
              element.textContent = '2';
              velocity_level = 1;
              break;
          case 2:
              element.classList.remove('normal');
              element.classList.add('hard');
              element.textContent = '3';
              velocity_level = 2;
              break;
          case 3:
              element.classList.remove('hard');
              element.classList.add('easy');
              element.textContent = '1';
              velocity_level = 0;
              break;
          default:
              element.textContent = '2';
              velocity_level = 1;
              break;
      }
  }

  function changeTimeLevel(e, n) {
      const element = timeLevelDOM.children[1];
      const currentLevel = n || element.textContent;
      if (volume_level) {
          start_sfx.currentTime = 0.125;
          start_sfx.play();
      }
      switch (currentLevel) {
          case '30':
              element.classList.remove('easy');
              element.classList.add('normal');
              element.textContent = '10';
              time_level = 1;
              break;
          case '10':
              element.classList.remove('normal');
              element.classList.add('hard');
              element.textContent = '5';
              time_level = 2;
              break;
          case '5':
              element.classList.remove('hard');
              element.classList.add('easy');
              element.textContent = '30';
              time_level = 0;
              break;
          default:
              element.textContent = '10';
              time_level = 1;
              break;
      }
  }

  function changeVolumeLevel() {
      const element = volumeLevelDOM.children[1];
      const currentLevel = element.textContent;
      switch (currentLevel) {
          case 'X':
              element.textContent = '';
              volume_level = 1;
              break;
          default:
              element.textContent = 'X';
              volume_level = 0;
              break;
      }
      if (volume_level) {
          start_sfx.currentTime = 0.125;
          start_sfx.play();
      }
  }
});