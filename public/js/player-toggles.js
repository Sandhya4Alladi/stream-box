const video = document.getElementById("videoPlayer");
const likeBtn = document.querySelector(".like-btn");
const dislikeBtn = document.querySelector(".dislike-btn");

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowleft") {
    video.currentTime -= 10;
  } else if (key === "arrowright") {
    video.currentTime += 10;
  }
});

function skipBackward() {
  video.currentTime -= 10;
}

function skipForward() {
  video.currentTime += 10;
}
function togglePause() {
  if (video.paused) {
    video.play();
    pauseIcon.className = "fa fa-pause"; // Change icon to pause
  } else {
    video.pause(); // If video is playing, pause it
    pauseIcon.className = "fa fa-play"; // Change icon to play
  }
}

video.addEventListener('play', function(){
  sendPlayRecord(id);
})
 
function sendPlayRecord(id){
  try{
    fetch("/videos/plays", {
      method: "PUT",
      body: JSON.stringify({id:id}),
      headers: {'Content-Type': 'application/json'}
    });
  }
  catch(err){
    console.log(err)
  }
}

function checkStatus(id) {
  fetch("/users/status/" + id, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data.liked) {
        const likeBtn = document.querySelector(".like-btn");
        likeBtn.classList.add("selected");
      } else if (data.disliked) {
        const dislikeBtn = document.querySelector(".dislike-btn");
        dislikeBtn.classList.add("selected");
      }
    })
    .catch((error) => {
      console.error("Error fetching status:", error);
    });
}

function checkWatch(id) {
  fetch("/users/track/" + id, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data.watched) {
        const watchBtn = document.querySelector(".clock-btn");
        watchBtn.classList.add("selected");
      }
    })
    .catch((error) => {
      console.error("Error fetching status:", error);
    });
}

window.addEventListener("load", () => {
  const videoId = `${id}`;
  console.log(videoId);
  checkStatus(videoId);
  checkWatch(videoId);
});

function toggleLike(btn, id) {
  btn.classList.toggle("clicked");
  dislikeBtn.classList.remove("clicked");
  likeBtn.classList.toggle("selected");
  dislikeBtn.classList.remove("selected");

  try {
    fetch("/users/like", {
      method: "post",
      body: JSON.stringify({ id: id }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
}

function toggleDislike(btn, id) {
  btn.classList.toggle("clicked");
  const likeBtn = document.querySelector(".like-btn");
  likeBtn.classList.remove("clicked");
  btn.classList.add("selected");
  likeBtn.classList.remove("selected");

  try {
    fetch("/users/dislike", {
      method: "post",
      body: JSON.stringify({ id: id }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
}

function toggleClock(btn, id) {
  btn.classList.toggle("clicked");

  try {
    fetch("/users/watch", {
      method: "post",
      body: JSON.stringify({ id: id }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
}

document.getElementById("chatButton").addEventListener("click", function () {
  toggleComments(id);
  var commentSection = document.getElementById("chatContent");
  commentSection.style.display = "block";
});