function display(data) {
    const n = data.length;
    if (n === 0) {
        document.getElementById("videos").innerHTML = "No Videos";
    } else {
        for (let i = 0; i < n; i++) {
            const card = document.createElement("div");
            card.classList.add("card");

            const overlay = document.createElement("div");
            overlay.classList.add("overlay");

            const key = data[i].videoKey;

            const a = document.createElement("a");
            a.href = `/videos/playvideo?data=${key}&id=${data[i]._id}`;

            card.appendChild(overlay);

            const titleContainer = document.createElement("div");
            titleContainer.classList.add("title-container");

            const title = document.createElement("button");
            title.innerText = data[i].title;
            title.className = "btn btn-primary";
            title.style.width = "90%"; 

            title.href = a.href;

            const ellipsisButton = document.createElement("button");
            ellipsisButton.innerText = "...";
            ellipsisButton.className = "btn btn-secondary";
            ellipsisButton.style.width = "10%"; // Adjust width for ellipsis button

            const dropdownMenu = document.createElement("div");
            dropdownMenu.className = "dropdown-menu";
            dropdownMenu.style.display = "none";
            dropdownMenu.style.position = "absolute";
            dropdownMenu.style.backgroundColor = "#fff";
            dropdownMenu.style.border = "1px solid #ccc";
            dropdownMenu.style.padding = "5px";
            dropdownMenu.style.boxShadow = "0px 8px 16px 0px rgba(0,0,0,0.2)";
            dropdownMenu.style.zIndex = "1";

            const deleteOption = document.createElement("button");
            deleteOption.innerText = "Delete";
            deleteOption.className = "dropdown-item";
            deleteOption.style.width = "100%";
            deleteOption.style.backgroundColor = "red";
            deleteOption.addEventListener("click", function(event) {
                event.preventDefault();
                confirmDelete(data[i]._id);
            });

            dropdownMenu.appendChild(deleteOption);

            ellipsisButton.addEventListener("click", function(event) {
                event.preventDefault();
                if (dropdownMenu.style.display === "none") {
                    dropdownMenu.style.display = "block";
                } else {
                    dropdownMenu.style.display = "none";
                }
            });

            titleContainer.appendChild(title);
            titleContainer.appendChild(ellipsisButton);

            a.appendChild(titleContainer);

            a.addEventListener("click", function () {
                fetch("/videos/view/" + data[i]._id, {
                    method: "PUT",
                });
            });

            const imgElement = document.createElement("img");
            imgElement.src = `https://d2fpvsof67xqc9.cloudfront.net/${data[i].imgKey}`;
            card.appendChild(imgElement);
            card.appendChild(a);

            const deleteContainer = document.createElement("div");
            deleteContainer.classList.add("delete-container");
            deleteContainer.style.position = "absolute";
            deleteContainer.style.bottom = "0px";
            deleteContainer.style.right = "150px"; // Adjust position as needed

            deleteContainer.appendChild(dropdownMenu);

            card.appendChild(deleteContainer);

            document.getElementById("videos").appendChild(card);

        }
    }
}
 
function confirmDelete(videoId) {
    $('#deleteConfirmationModal').modal('show');
    document.getElementById('confirmDeleteButton').addEventListener('click', function() {
        console.log('Confirmed action');
        deleteVideo(videoId);
        $('#confirmationModal').modal('hide');
    });  
}

async function deleteVideo(videoId) {
    try {
        const response = await fetch(`/videos/${videoId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log("Video deleted successfully");
            location.reload();
        } else {
            console.error("Error deleting video:", response.status);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

