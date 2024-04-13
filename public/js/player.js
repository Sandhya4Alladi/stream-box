function showMessageBox(key) {
  document.getElementById('messageBoxOverlay').style.display = 'flex';
  const keyval=key.toString();
  document.getElementById('embed-code').innerText = `<iframe width="1000" height="800" src="https://streambox-ydlk.onrender.com/embed?key=${keyval}" frameborder='0'></iframe>`
}

function closeMessageBox() {
  document.getElementById('messageBoxOverlay').style.display = 'none';
}

function copyText() {
  var textToCopy = document.querySelector('.message-body p').innerText;

  navigator.clipboard.writeText(textToCopy)
    .then(function() {
      document.getElementById('copy').innerHTML = 'Copied';
      document.getElementById('copy').classList.remove('btn-secondary')
      document.getElementById('copy').classList.add('btn-light')
      setTimeout(function(){
        document.getElementById('copy').innerHTML = 'Copy';
      document.getElementById('copy').classList.remove('btn-light')
      document.getElementById('copy').classList.add('btn-secondary')
      }, 2000)
    })
    .catch(function(err) {
      console.error('Unable to copy text: ', err);
    });
}


function comment(id) {
  try {
    fetch("/comments/" + id, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: document.getElementById("com").value,
      }),
    })
    .then(()=>{
      toggleComments(id);
      document.getElementById("com").value = "";
    });
    }
   catch (err) {
    console.log(err);
  }
}
 

function toggleComments(id) {
  try {
    fetch("/comments/" + id, {
      method: "get",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((comments) => {
        const commentsContainer = document.getElementById("cmtContainer");
        commentsContainer.innerHTML = "";
        comments.forEach((comment) => {
          const commentElement = document.createElement("div");
          commentElement.style.width = "40%"
          commentElement.setAttribute("id", "cmtId");
          commentElement.innerHTML = `
         <label for="user"><b>@${comment.username}</b> : ${comment.desc}</label>
         <button class="delete-btn btn btn-secondary" onclick="deleteComment('${comment._id}')"><i class="fas fa-trash-alt"></i></button>
       `;
          commentsContainer.appendChild(commentElement);
        });
      });
  } catch (error) {
    console.log(error);
  }
}

function deleteComment(commentId) {
  console.log("comm....", commentId)
  fetch("/comments/" + commentId, {
    method: "DELETE",
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to delete comment");
    }
    toggleComments(id);
    const deletedComment = document.getElementById(commentId);
 
    if (deletedComment) {
      deletedComment.parentNode.removeChild(deletedComment);
    } else {
      console.warn("Deleted comment not found in DOM:", commentId);
    }
  })
  .catch((error) => {
    console.error("Error deleting comment:", error);
  });
}