document.addEventListener("DOMContentLoaded", () => {
    const highlightBtn = document.getElementById("highlight-btn");
    const extractBtn = document.getElementById("extract-btn");
    const extractWebpageBtn = document.getElementById("extract-webpage-btn");
    const outputDiv = document.getElementById("output");
  
    // Highlight containers when the button is clicked
    highlightBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "highlightContainers" }, (response) => {
          if (response?.success) {
            outputDiv.textContent = "Containers highlighted. Click on a container to select it.";
          }
        });
      });
    });
  
    // Extract articles when the button is clicked
    extractBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "extractArticles" }, (response) => {
          if (response?.articles?.length > 0) {
            outputDiv.innerHTML = `<pre>${JSON.stringify(response.articles, null, 2)}</pre>`;
          } else {
            outputDiv.textContent = "No articles found in the selected container.";
          }
        });
      });
    });

    // Extract articles when the button is clicked
    extractWebpageBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "extract-webpage-btn" }, (response) => {
            if (response?.articles?.length > 0) {
              outputDiv.innerHTML = `<pre>${JSON.stringify(response.articles, null, 2)}</pre>`;
            } else {
              outputDiv.textContent = "No articles found in the selected container.";
            }
          });
        });
      });
  });