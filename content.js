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

// function cleanText(text) {
//     // Remove script tags and their content
//     text = text.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');

//     // Remove double new lines and replace with a single new line
//     text = text.replace(/\n\s*\n/g, '\n');

//     // Trim extra spaces and new lines from the start and end
//     text = text.trim();

//     return text;
//   }

function cleanText(text) {
    text = text.replace(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
    text = text.replace(/\s(on\w+)=["'][^"']*["']/gi, '');

    // Remove all other HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Remove double new lines and replace with a single new line
    text = text.replace(/\n\s*\n/g, '\n');

    // Trim extra spaces and new lines from the start and end
    text = text.trim();

    return text;
}

async function getHeadOfPage(link) {
    try {
        // Fetch the HTML content of the page
        const response = await fetch(link);
        const headHTML = await response.text();

        // // Use DOMParser to parse the HTML
        // const parser = new DOMParser();
        // const doc = parser.parseFromString(htmlText, "text/html");
        // // Extract the <head> section
        // const head = doc.head;
        // // Return the inner HTML of the <head> section
        // return head.innerHTML;

        // Parse the head HTML into a DOM object
        const parser = new DOMParser();
        const doc = parser.parseFromString(headHTML, "text/html");

        const head = doc.head;
        const body = doc.body;

        // Extract the title (prefer og:title, fallback to <title>)
        const title = head.querySelector('meta[property="og:title"]')?.content || doc.querySelector('title')?.textContent || '';

        // Extract the description (prefer og:description, fallback to description)
        const description = head.querySelector('meta[property="og:description"]')?.content || doc.querySelector('meta[name="description"]')?.content || '';

        // Extract the image (og:image)
        const image = head.querySelector('meta[property="og:image"]')?.content || '';

        // Extract the URL (og:url)
        const url = head.querySelector('meta[property="og:url"]')?.content || link;

        // Extract the author
        const author = head.querySelector('meta[name="author"]')?.content || doc.querySelector('meta[name="Author"]')?.content || '';

        //
        const full_description = cleanText(body.outerHTML || body.innerText || body.textContent || '');

        // Return the extracted information
        return {
            title,
            description,
            full_description,
            image,
            url,
            author,
            // head,
            // body
        };
    } catch (error) {
        console.log("Error fetching the page:", error);
        return null;
    }
}

// Example usage
// getHeadOfPage("https://example.com").then(headContent => {
//     console.log(headContent);
// });

function findAllLinks() {
    // Define the pattern to match (current page's pathname)
    const pattern = location.pathname; // e.g., "/online/world/2025/03/08/1489868"
    // Select all anchor elements with an href attribute, excluding those in <nav> and <footer>
    const anchors = document.querySelectorAll('a[href]:not(nav a):not(footer a)');

    // Filter anchors whose href matches the pattern
    const matchingAnchors = Array.from(anchors).filter(anchor => {
        // Get the href value of the anchor (absolute or relative)
        const anchorHref = anchor.href;
        // Check if the href includes the pattern
        console.log(anchorHref, location.href, anchorHref != location.href, Math.abs(anchorHref.length - location.href.length) > 1);

        return anchorHref != location.href && Math.abs(anchorHref.length - location.href.length) > 1
            && anchorHref.includes(pattern);
    });

    // Log the matching anchors
    console.log(matchingAnchors);
    return matchingAnchors;
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
        sendResponse({ articles: newsArticles, host: location.host });
    } else {

        let allArticles = [];
        let links = findAllLinks();
        console.log(`Found ${links.length} news.`, links);
        // Extract href attributes and filter out empty or invalid links

        // Use a Set to remove duplicates
        links = [...new Set(links)];

        // sendResponse({ update: `Found ${links.length} news.` });

        // Promise.all(links.map((link, index)=>{
        //     // sendResponse({ update: `Loading: ${index + 1}/${links.length}.` });
        //     console.log(`Loading: ${index + 1}/${links.length}.`);
        //     return getHeadOfPage(link);
        // })).then((allArticles) => {
        //     console.log("Extracted articles:", allArticles);
        //     sendResponse({ articles: allArticles, host: location.host });
        // });

        new Promise(async (res, rej) => {
            for (let index = 0; index < links.length; index++) {
                const link = links[index];
                // sendResponse({ update: `Loading: ${index + 1}/${links.length}.` });
                // console.log(`Loading: ${index + 1}/${links.length}.`);

                let head = await getHeadOfPage(link);
                if (head) {
                    allArticles.push(head);
                }

                // // Ensure toastr is loaded
                // if (typeof toastr !== 'undefined') {
                //     // Configure toastr options
                //     toastr.options = {
                //         closeButton: true,
                //         progressBar: true,
                //         positionClass: 'toast-top-right',
                //         timeOut: 3000,
                //         extendedTimeOut: 1000
                //     };

                //     // Show a toast notification
                //     toastr.success(`Loading: ${index + 1}/${links.length}.`);
                // } else {
                //     console.error('Toastr is not found.'+`Loading: ${index + 1}/${links.length}.`);
                // }
            }
            res();
        }).then((r) => {
            console.log("Extracted articles:", allArticles);
            sendResponse({ articles: allArticles, host: location.host });
        });

    }
    return true; // Required for async response
});