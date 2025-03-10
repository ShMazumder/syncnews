document.addEventListener("DOMContentLoaded", () => {
    // const highlightBtn = document.getElementById("highlight-btn");
    // const extractBtn = document.getElementById("extract-btn");
    // const extractWebpageBtn = document.getElementById("extract-webpage-btn");
    const extractAllBtn = document.getElementById("extract-all-btn");
    const downloadAllBtn = document.getElementById("download-all-btn");
    const outputDiv = document.getElementById("output");

    // // Highlight containers when the button is clicked
    // highlightBtn.addEventListener("click", () => {
    //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //         chrome.tabs.sendMessage(tabs[0].id, { action: "highlightContainers" }, (response) => {
    //             if (response?.success) {
    //                 outputDiv.textContent = "Containers highlighted. Click on a container to select it.";
    //             }
    //         });
    //     });
    // });

    // // Extract articles when the button is clicked
    // extractBtn.addEventListener("click", () => {
    //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //         chrome.tabs.sendMessage(tabs[0].id, { action: "extractArticles" }, (response) => {
    //             if (response?.articles?.length > 0) {
    //                 outputDiv.innerHTML = `<pre>${JSON.stringify(response.articles, null, 2)}</pre>`;
    //             } else {
    //                 outputDiv.textContent = "No articles found in the selected container.";
    //             }
    //         });
    //     });
    // });

    // // Extract articles when the button is clicked
    // extractWebpageBtn.addEventListener("click", () => {
    //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //         chrome.tabs.sendMessage(tabs[0].id, { action: "extract-webpage-btn" }, (response) => {
    //             if (response?.articles?.length > 0) {
    //                 let host = response.host || location.hostname;
    //                 let time = Date.now();
    //                 downloadAsTSV(response.articles, `${host}_${time}.tsv`);
    //                 outputDiv.innerHTML = `<pre>${JSON.stringify(response.articles, null, 2)}</pre>`;
    //             } else {
    //                 outputDiv.textContent = "No articles found in the selected container.";
    //             }
    //         });
    //     });
    // });

    extractAllBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "extract-all-btn" }, (response) => {
                if (response?.articles?.length > 0) {
                    let host = response.host || location.hostname;
                    let time = Date.now();
                    downloadAsTSV(response.articles, `${host}_${time}.tsv`);
                    // outputDiv.innerHTML = `<pre>${JSON.stringify(response.articles, null, 2)}</pre>`;
                    outputDiv.innerHTML = `<pre>${response.articles.length} articles extracted</pre>`;
                    // window.articles = [...(window.articles || []), ...response.articles]
                } else if (response?.update) {
                    outputDiv.innerHTML = `${update}`;
                } else {
                    outputDiv.textContent = "No articles found in the selected container.";
                }
            });
        });
    });

    downloadAllBtn.addEventListener('click', () => {
        let host = location.hostname;
        let time = Date.now();
        downloadAsTSV((window.articles || []), `${host}_${time}.tsv`);

    });
    function downloadAsTSV(data, filename) {
        if (!data || data.length === 0) {
            console.error("No data to download.");
            return;
        }
    
        // Collect all unique headers in the order they first appear
        const headers = [];
        const seenHeaders = new Set();
        for (const item of data) {
            for (const key of Object.keys(item)) {
                if (!seenHeaders.has(key)) {
                    seenHeaders.add(key);
                    headers.push(key);
                }
            }
        }
    
        if (headers.length === 0) {
            console.error("No valid headers found in the data.");
            return;
        }
    
        // Convert array of objects to TSV string
        const tsvString = [
            // Header row
            headers.join("\t"),
            // Data rows
            ...data.map(item =>
                headers.map(header => {
                    // Handle missing values and special characters
                    const value = item.hasOwnProperty(header) ? item[header] : '';
                    return String(value)
                        .replace(/[\t\n]/g, " ")  // Replace tabs and newlines
                        .replace(/"/g, '""');     // Escape double quotes
                }).join("\t")
            )
        ].join("\n");
    
        // Create Blob with UTF-8 BOM for Excel compatibility
        const blob = new Blob(["\uFEFF" + tsvString], {
            type: "text/tab-separated-values; charset=UTF-8"
        });
    
        // Create and trigger download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename || "data.tsv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        // Cleanup
        URL.revokeObjectURL(link.href);
    }
});