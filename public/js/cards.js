function display(data) {
  const n = data.length;
  if (n === 0) {
    document.getElementById("videos").innerHTML = "No Videos";
  } else {
    for (let i = 0; i < 1; i++) {
      const card = document.createElement("div");
      card.classList.add("card");

      const overlay = document.createElement("div");
      overlay.classList.add("overlay");

      const key = data[i].videoKey;
      
      const a = document.createElement("a");
      a.href =  `/videos/playvideo?data=${key}&id=${data[i]._id}`

      card.appendChild(overlay);
      const title = document.createElement("button")
      title.innerText = data[i].title;
      title.className = "btn btn-primary";
      title.id = "video-button";
      title.style.width = "100%"; 

      a.appendChild(title);

      a.addEventListener("click", function () {
        fetch("/videos/view/" + data[i]._id, {
          method: "PUT",
        });
      });

      const imgElement = document.createElement("img");
      imgElement.src = `https://d2fpvsof67xqc9.cloudfront.net/${data[i].imgKey}`;
      card.appendChild(imgElement);
      card.appendChild(a);

      document.getElementById("videos").appendChild(card);
    }
  }
}
