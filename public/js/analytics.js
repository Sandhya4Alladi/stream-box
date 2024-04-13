function createVideoInfoContainer(i, title, likes, dislikes, plays, views) {
    return `
        <div class="video-info">
            <h2 style="margin-bottom: 15px;">
                <span id="title${i}">
                    ${title}
                </span>
            </h2>
            <div class="info-row">
                <div class="info-box">
                    <span>Likes</span>
                    <span id="likes${i}">
                        ${likes}
                    </span>
                </div>
                <div class="info-box">
                    <span>Dislikes</span>
                    <span id="dislikes${i}">
                        ${dislikes}
                    </span>
                </div>
                <div class="info-box">
                    <span>Views</span>
                    <span id="views${i}">
                        ${views}
                    </span>
                </div>
                <div class="info-box">
                    <span>Plays</span>
                    <span id="plays${i}">
                        ${plays}
                    </span>
                </div>
            </div>
            <div id="donutChartContainer" style="display: flex; justify-content: center; align-items: center;">
                <canvas id="donutChart_${i}" width="400" height="400"></canvas>
            </div>
        </div>
    `;
}



            

            document.addEventListener("DOMContentLoaded", function () {
                try {
                    console.log(overall)
                    var decodedData = decodeURIComponent(overall.replace(/&#34;/g, '"'))
                    decodedData = JSON.parse(decodedData)
                  
                    const totalLikes = decodedData["totalLikes"];
                    const totalDislikes = decodedData["totalDisLikes"];
                    const totalPlays = decodedData["totalPlays"];
                    const totalViews = decodedData["totalViews"];
                    document.getElementById('totalLikes').textContent = totalLikes;
                    document.getElementById('totalDislikes').textContent = totalDislikes;
                    document.getElementById('totalViews').textContent = totalViews;
                    document.getElementById('totalPlays').textContent = totalPlays;
                    document.getElementById('playRate').textContent = Math.round((totalPlays/totalViews)*100)+'%';
                    const ctx = document.getElementById('donutChart').getContext('2d');

                    // Creating the donut chart
                    const donutChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Likes %', 'Dislikes %', 'Neutral %'],
                            datasets: [{
                                data: [(totalLikes/totalViews)*100, (totalDislikes/totalViews)*100, ((totalViews-totalLikes-totalDislikes)/totalViews)*100],
                                backgroundColor: [
                                    'rgb(75, 192, 192)', 
                                    'rgb(255, 99, 132)', 
                                    'rgb(255, 205, 86)', 
                                ],
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: false, 
                            maintainAspectRatio: false, 
                            title: {
                                display: true,
                                text: 'Overall Report - Donut Chart'
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error creating donut chart:', error);
                }
            });


    document.addEventListener("DOMContentLoaded", function () {
    console.log(videodata)
    const videoinfo = JSON.parse(decodeURIComponent(videodata.replace(/&#34;/g, '"')));
    console.log(videoinfo)
    videoinfo.forEach((item, i) => {
        try {
            console.log(item);
            const decodedData = item;
            const title = decodedData.title;
            const likes = decodedData.likes;
            const dislikes = decodedData.dislikes;
            const plays = decodedData.plays;
            const views = decodedData.views;
            //const playRate = (plays/views)
            const containerHTML = createVideoInfoContainer(i, title, likes, dislikes, plays, views);
            document.querySelector('.container').insertAdjacentHTML('beforeend', containerHTML);


            const ctx = document.getElementById(`donutChart_${i}`).getContext('2d');
            const donutChart = new Chart(ctx, {
                type: 'doughnut',
                data: { 
                    labels: ['Likes %', 'Dislikes %', 'Neutral %'],
                    datasets: [{
                        data: [(likes/views)*100, (dislikes/views)*100, ((views-likes-dislikes)/views)*100],
                        backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(255, 205, 86)', ],
                        hoverOffset: 4
                    }]
                },
                options: {responsive: false, maintainAspectRatio: false, 
                title: {isplay: true, text: title,}
                    }
                });
            } catch (error) {
                console.error('Error creating doughnut chart:', error);
              }
           });
        });