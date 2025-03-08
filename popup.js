document.addEventListener("DOMContentLoaded", () => {
    // const highlightBtn = document.getElementById("highlight-btn");
    // const extractBtn = document.getElementById("extract-btn");
    // const extractWebpageBtn = document.getElementById("extract-webpage-btn");
    const extractAllBtn = document.getElementById("extract-all-btn");
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
                    outputDiv.innerHTML = `<pre>${JSON.stringify(response.articles, null, 2)}</pre>`;
                } else {
                    outputDiv.textContent = "No articles found in the selected container.";
                }
            });
        });
    });

    function downloadAsTSV(data, filename) {
        // Convert array of objects to TSV string
        const tsvString = [
            // Create header row from object keys
            Object.keys(data[0]).join("\t"),
            // Create rows for each object
            ...data.map(item =>
                Object.values(item)
                    .map(value => String(value).replace(/\t/g, " ")) // Replace tabs in values to avoid breaking TSV
                    .join("\t")
            )
        ].join("\n");

        // Create a Blob with the TSV data
        const blob = new Blob([tsvString], { type: "text/tab-separated-values" });

        // Create a link element to trigger the download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename || "articles.tsv";

        // Trigger the download
        link.click();

        // Clean up
        URL.revokeObjectURL(link.href);
    }
});