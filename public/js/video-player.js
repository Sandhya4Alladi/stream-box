async function sendPlaybackPosition(position, videoId) {
  try {
    await fetch(`/videos/playbackposition/${videoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playbackPosition: position }),
    });
  } catch (error) {
    console.error("Error sending playback position:", error);
  }
}

async function fetchPlaybackPosition(videoId) {
  try {
    const response = await fetch(`/videos/playbackposition/${videoId}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    const data = await response.json();
    console.log(`Playback position for video ${videoId} retrieved:`, data);
    return parseFloat(data.playbackPosition);
    } catch (error) {
    console.error(`Error retrieving playback position for video ${videoId}:`, error);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const playbackPosition = await fetchPlaybackPosition(id)
  if (!isNaN(playbackPosition) && playbackPosition!=0){
  $('#confirmationModal').modal('show');

  $('#confirmYes').on('click', async function() {
    $('#confirmationModal').modal('hide'); 
    videoPlayer.currentTime = playbackPosition;
  });

  $('#confirmNo').on('click', async function() {
    console.log("no")
    await sendPlaybackPosition(0, id);
    videoPlayer.currentTime = 0; 
  });
}
});

videoPlayer.addEventListener("timeupdate", async () => {
  const currentTime = videoPlayer.currentTime;
  await sendPlaybackPosition(currentTime, id);
});
