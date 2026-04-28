import { YOUTUBE_API_KEY } from '../../config.js';

const videoSearchInput = document.getElementById("videoSearchInput");
const videoSearchBtn = document.getElementById("videoSearchBtn");
const videoResults = document.getElementById("videoResults");
const videoPlayer = document.getElementById("videoPlayer");
const videoStatus = document.getElementById("videoStatus");

/**
 * @param {string} videoId
 * @returns {void}
 * @description Updates the central iframe player to play the selected YouTube video.
 */
function updatePlayer(videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    videoPlayer.src = embedUrl;

    const fallbackBox = document.getElementById("playerFallback");
    const watchLink = document.getElementById("watchOnYouTube");

    watchLink.href = youtubeUrl;
    fallbackBox.classList.add("d-none");

    // Show fallback if the embed likely failed
    setTimeout(() => {
        fallbackBox.classList.remove("d-none");
    }, 2500);
}
/**
 * @param {Array} videos
 * @returns {void}
 * @description Renders the top 5 video thumbnails and titles using template literals.
 */
function displayVideos(videos) {
    videoResults.innerHTML = "";

    if (!videos.length) {
        videoResults.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning mb-0">No videos found for that search.</div>
            </div>
        `;
        return;
    }

   const videosHTML = videos.map(video => {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card video-card shadow-sm border-0 h-100">
                <img src="${thumbnail}" alt="${title}" class="video-thumbnail">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${title}</h5>
                    <div class="mt-auto d-flex gap-2">
                        <button class="btn btn-danger btn-sm play-btn" data-video-id="${videoId}">
                            Play Here
                        </button>
                        <a href="${youtubeUrl}" target="_blank" class="btn btn-outline-dark btn-sm">
                            Open in YouTube
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}).join("");

videoResults.innerHTML = videosHTML;

document.querySelectorAll(".play-btn").forEach(button => {
    button.addEventListener("click", () => {
        const selectedVideoId = button.getAttribute("data-video-id");
        updatePlayer(selectedVideoId);
    });
});
    videoResults.innerHTML = videosHTML;

    document.querySelectorAll(".video-card").forEach(card => {
        card.addEventListener("click", () => {
            const selectedVideoId = card.getAttribute("data-video-id");
            updatePlayer(selectedVideoId);
        });
    });
}


/**
 * @param {string} query
 * @returns {Promise<Array>}
 * @description Fetches the top 5 YouTube videos matching the search term.
 */
async function fetchVideos(query) {
    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
}

/**
 * @returns {Promise<void>}
 * @description Reads the search input, fetches videos, renders thumbnails,
 * and updates the iframe with the first result.
 */
async function searchVideos() {
    const query = videoSearchInput.value.trim();

    if (!query) {
        videoStatus.textContent = "Please enter a video topic.";
        videoResults.innerHTML = "";
        return;
    }

    try {
        videoSearchBtn.disabled = true;
        videoStatus.textContent = `Searching for "${query}"...`;
        videoResults.innerHTML = "";

        const videos = await fetchVideos(query);
        displayVideos(videos);

        if (videos.length > 0) {
            updatePlayer(videos[0].id.videoId);
        }

        videoStatus.textContent = `Showing top 5 videos for "${query}"`;
    } catch (error) {
        console.error("YouTube API error:", error);
        videoResults.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger mb-0">
                    Something went wrong while fetching videos.
                </div>
            </div>
        `;
        videoStatus.textContent = "Search failed. Check your API key or console.";
    } finally {
        videoSearchBtn.disabled = false;
    }
}

videoSearchBtn.addEventListener("click", searchVideos);

videoSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchVideos();
    }
});