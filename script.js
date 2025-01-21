let currentSong = 0,
  active_source = null,
  isPlaying = false,
  buffers = {},
  context = new (window.AudioContext || window.webkitAudioContext)(),
  analyser = context.createAnalyser(),
  nowPlaying = [
    "Nombre Artista",
    "Nombre Artista",
    "Nombre Artista",
    "Nombre Artista",
    "Nombre Artista",
    "Nombre Artista",
    "Nombre Artista",
    "Nombre Artista",
  ],
  songPlaying = [
    "Nombre Sala",
    "Nombre Sala",
    "Nombre Sala",
    "Nombre Sala",
    "Nombre Sala",
    "Nombre Sala",
    "Nombre Sala",
    "Nombre Sala",
  ],
  tracks = document.querySelectorAll("a");

document.querySelectorAll("li a").forEach((title, index) => {
  title.addEventListener("click", function () {
    document.querySelectorAll(".active").forEach((active) => {
      active.classList.remove("active");
    });
    document.querySelectorAll("img")[index].classList.add("active");
    title.classList.add("active");
    currentSong = index;
    document.getElementById("artist").textContent = nowPlaying[currentSong];
    document.getElementById("song").textContent = songPlaying[currentSong];
  });
});

window.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "ArrowDown" || key === "ArrowRight") {
    playNext();
  }
  if (key === "ArrowUp" || key === "ArrowLeft") {
    playPrev();
  }
});

function playNext() {
  if (currentSong < 9) {
    currentSong++;
    document.querySelectorAll("li a")[currentSong].click();
  }
}

function playPrev() {
  if (currentSong > 0) {
    currentSong--;
    document.querySelectorAll("li a")[currentSong].click();
  }
}

Draggable.create(".window, .nowplaying, .analyzer", {
  bounds: document.body,
  type: "x,y",
  inertia: true
});

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("loaded");
  document.querySelectorAll("li a")[0].click();
  draw();
});

// Web Audio API stuff

function stopActiveSource() {
  if (active_source) {
    active_source.onended = null;
    active_source.stop(0);
  }
}
function playTrack(url) {
  let buffer = buffers[url];
  stopActiveSource();
  let source = context.createBufferSource();
  source.connect(analyser);
  active_source = source;
  source.onended = function () {
    active_source = null;
    if (currentSong < 9) {
      currentSong++;
      document.querySelectorAll("li a")[currentSong].click();
    }
  };

  source.buffer = buffer;
  source.connect(context.destination);

  source.start(0);
}

document.getElementById("play").addEventListener("click", function () {
  isPlaying = !isPlaying;
  this.classList.toggle("playing");
  document.querySelectorAll("li a")[currentSong].click();
  setTimeout(() => {
    if (isPlaying) {
      playTrack(tracks[currentSong]);
    } else {
      stopActiveSource();
    }
  }, 100);
});

for (let i = 0, len = tracks.length; i < len; i++) {
  tracks[i].addEventListener("click", function (e) {
    if (isPlaying) {
      playTrack(this.href);
    }
    analyser.fftSize = 2048;
    e.preventDefault();
  });
  getBuffer(tracks[i].href);
}

function draw() {
  requestAnimationFrame(draw);
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  for (let i = 0; i < 11; i++) {
    document.body.style.setProperty("--top" + i, dataArray[i * 2] * 0.015);
  }
}

function getBuffer(url) {
  let request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function (evt) {
    context.decodeAudioData(request.response, store);
  };
  request.send();

  function store(buffer) {
    buffers[url] = buffer;
  }
}

let dt = new Date();
document.getElementById("date").textContent =
  dt.toLocaleString("en-us", { weekday: "short" }) +
  " " +
  dt.toLocaleString("default", { month: "short" }) +
  " " +
  dt.getDate();