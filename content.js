let selectedContainer = null;

// Function to highlight potential containers more precisely
function highlightContainers() {
    const containerSelectors = [
        "article", // Common for articles
        ".article", ".news-item", ".post", ".card", ".story", // Common classes
        "div[role='article']", // ARIA roles
        "section", // HTML5 section
    ];

    const containers = [];
    containerSelectors.forEach(selector => {
        const foundContainers = document.querySelectorAll(selector);
        foundContainers.forEach(container => {
            // Exclude containers that are unlikely to hold news articles
            if (!container.closest("header, footer, aside, nav")) {
                containers.push(container);
            }
        });
    });

    containers.forEach(container => {
        container.style.border = "2px solid red";
        container.style.cursor = "pointer";

        // Add click event listener to select the container
        container.addEventListener("click", () => {
            selectedContainer = container;
            containers.forEach(c => {
                c.style.border = ""; // Remove highlight from other containers
            });
            container.style.border = "2px solid green"; // Highlight selected container
            console.log("Selected container:", container);
        });
    });

    console.log("Highlighted containers:", containers.length);
}

// Function to extract articles from the selected container
function extractArticlesFromSelectedContainer() {
    if (!selectedContainer) {
        console.log("No container selected.");
        return [];
    }

    const articles = [];
    const articleElements = selectedContainer.querySelectorAll("h1, h2, h3, .title, .headline");

    articleElements.forEach(article => {
        const titleElement = article;
        const linkElement = article.closest("a") || article.querySelector("a");
        const descriptionElement = article.nextElementSibling?.tagName === "P" ? article.nextElementSibling : null;
        const imageElement = article.parentElement.querySelector("img");

        const title = titleElement ? titleElement.textContent.trim() : "";
        const link = linkElement ? linkElement.href : "";
        const description = descriptionElement ? descriptionElement.textContent.trim() : "";
        const image = imageElement ? imageElement.src : "";

        if (title || link) {
            articles.push({ title, link, description, image });
        }
    });

    console.log("Extracted articles:", articles);
    return articles;
}

// Function to extract news articles from a container
function extractArticlesFromKalerkanthoContainer(container) {
    const articles = [];

    // Find all article-like elements within the container
    const articleElements = container.querySelectorAll("a[href]");

    articleElements.forEach(article => {
        if (!article.textContent.trim().length) {
            article = article.parentElement.parentElement;
        }

        const titleElement = article.querySelector("h4, h5");
        const descriptionElement = article.querySelector("p");
        const imageElement = article.querySelector("img");
        const timeElement = article.querySelector("time");

        const title = titleElement ? titleElement.textContent.trim() : "";
        const link = article.href;
        const description = descriptionElement ? descriptionElement.textContent.trim() : "";
        const image = imageElement ? imageElement.src : "";
        const time = timeElement ? timeElement.textContent.trim() : "";

        if (title || link) {
            articles.push({ title, link, description, image, time });
        }
    });

    return articles;
}

// Function to extract all news articles from the page
function extractNewsArticlesFromKalerkantho() {
    const allArticles = [];

    // Define all possible containers for articles
    const containers = [
        ...document.querySelectorAll(
            ".row.position-relative, .col-6.col-md-4.col-lg-4.col-xl-4, .catLead"
        ),
        document.querySelector(".col-12.col-lg-4.col-xl-5"),
        document.querySelector(".col-sm-12.col-md-12.col-lg-9.col-xl-9"), // Main content area
        document.querySelector(".widget"), // Sidebar or widget area
        document.querySelector(".cat_selected"), // Selected articles section
    ];

    // Extract articles from each container
    containers.forEach(container => {
        if (container) {
            const articles = extractArticlesFromKalerkanthoContainer(container);
            allArticles.push(...articles);
        }
    });

    return allArticles;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightContainers") {
        highlightContainers();
        sendResponse({ success: true });
    } else if (request.action === "extractArticles") {
        const articles = extractArticlesFromSelectedContainer();
        sendResponse({ articles });
    } else if (request.action === "extract-webpage-btn") {
        // Call the function and log the results
        const newsArticles = extractNewsArticlesFromKalerkantho();
        console.log("Extracted articles:", newsArticles);
        sendResponse({ articles: newsArticles });
    }
    return true; // Required for async response
});