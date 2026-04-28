import { NYT_API_KEY } from '../../config.js';


const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const newsResults = document.getElementById("newsResults");
const loadingSpinner = document.getElementById("loadingSpinner");
const statusMessage = document.getElementById("statusMessage");

/**
 * @param {boolean} show
 * @returns {void}
 * @description Shows or hides the loading spinner while articles are being fetched.
 */
function toggleSpinner(show) {
    loadingSpinner.classList.toggle("d-none", !show);
}

/**
 * @param {Array} articles
 * @returns {void}
 * @description Renders NYT article results into Bootstrap card elements in a grid layout.
 */
function displayArticles(articles) {
    newsResults.innerHTML = "";

    if (!articles.length) {
        newsResults.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning mb-0">No articles found for that search.</div>
            </div>
        `;
        return;
    }

    const cardsHTML = articles.map(article => {
        const headline = article.headline?.main || "No headline available";
        const leadParagraph =article.lead_paragraph || article.abstract || article.snippet || "No description available.";
        const articleUrl = article.web_url || "#";

        return `
            <div class="col-md-6 col-lg-4">
                <div class="card news-card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <h5 class="card-title">${headline}</h5>
                        <p class="card-text text-muted">${leadParagraph}</p>
                        <a href="${articleUrl}" target="_blank" class="btn btn-outline-primary">
                            Read More
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    newsResults.innerHTML = cardsHTML;
}

/**
 * @param {string} query
 * @returns {Promise<Array>}
 * @description Sends a fetch request to the NYT Article Search API and returns article documents.
 */
async function fetchNews(query) {
    const endpoint = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(query)}&api-key=${NYT_API_KEY}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.response.docs;
}

/**
 * @returns {Promise<void>}
 * @description Reads the search input, fetches news articles, shows a loading spinner,
 * and updates the DOM with the search results.
 */
async function searchNews() {
    const query = searchInput.value.trim();

    if (!query) {
        statusMessage.textContent = "Please enter a search topic.";
        newsResults.innerHTML = "";
        return;
    }

    try {
        statusMessage.textContent = `Searching for "${query}"...`;
        searchBtn.disabled = true;
        toggleSpinner(true);
        newsResults.innerHTML = "";

        const articles = await fetchNews(query);
        displayArticles(articles);

        statusMessage.textContent = `Showing results for "${query}"`;
    } catch (error) {
        console.error("NYT API error:", error);
        newsResults.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger mb-0">
                    Something went wrong while fetching articles.
                </div>
            </div>
        `;
        statusMessage.textContent = "Search failed. Check your API key or console.";
    } finally {
        toggleSpinner(false);
        searchBtn.disabled = false;
    }
}

searchBtn.addEventListener("click", searchNews);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchNews();
    }
});