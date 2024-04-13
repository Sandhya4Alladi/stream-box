const logobtn = document.getElementById("streambox-logo");
logobtn.addEventListener("click", function () {
    fetch("/home", {
        method: "get",
    })
    .then((response) => {
        if (response.ok) {
            window.location.href = "/home";
        } else {
            console.error("Error fetching data:", response.status);
        }
    })
    .catch((error) => {
        console.error("Fetch error:", error);
    });
});