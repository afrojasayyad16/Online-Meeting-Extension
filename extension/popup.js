// document.addEventListener("DOMContentLoaded", () => {
//   const startTranscription = document.getElementById("startTranscription");
//   const stopTranscription = document.getElementById("stopTranscription");
//   const generateSummary = document.getElementById("generateSummary");
//   const statusText = document.getElementById("statusText");

//   let startTime = null;
//   let endTime = null;

//   // Retrieve the current state from storage
//   chrome.storage.local.get("isTranscribing", (data) => {
//     if (data.isTranscribing) {
//       startTranscription.disabled = true;
//       stopTranscription.disabled = false;
//       statusText.innerText = "Transcription Started...";
//     } else {
//       startTranscription.disabled = false;
//       stopTranscription.disabled = true;
//       statusText.innerText = "Ready";
//     }
//   });

//   // Start Transcription
//   startTranscription.addEventListener("click", async () => {
//     try {
//       const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//       if (!tab) throw new Error("No active tab found.");

//       // Ensure the content script is injected
//       await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         files: ["content.js"],
//       });

//       // Send message to content script
//       await chrome.tabs.sendMessage(tab.id, { type: "turnOnStream" });
//       startTranscription.disabled = true;
//       stopTranscription.disabled = false;
//       statusText.innerText = "Transcription Started...";
//       chrome.storage.local.set({ isTranscribing: true });

//       // Set the start time to the current time
//       startTime = new Date().toLocaleTimeString();
//       chrome.storage.local.set({ start_time: startTime });
//     } catch (error) {
//       console.error("Error starting transcription:", error);
//       alert("⚠ Error starting transcription. Please refresh the page and try again.");
//     }
//   });

//   // Stop Transcription
//   stopTranscription.addEventListener("click", async () => {
//     try {
//       const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//       if (!tab) throw new Error("No active tab found.");

//       // Send message to content script
//       await chrome.tabs.sendMessage(tab.id, { type: "turnOffStream" });
//       startTranscription.disabled = false;
//       stopTranscription.disabled = true;
//       generateSummary.disabled = false;
//       statusText.innerText = "Transcription Stopped";
//       chrome.storage.local.set({ isTranscribing: false });

//       // Set the end time to the current time
//       endTime = new Date().toLocaleTimeString();
//       chrome.storage.local.set({ end_time: endTime });
//     } catch (error) {
//       console.error("Error stopping transcription:", error);
//       alert("⚠ Error stopping transcription. Please refresh the page and try again.");
//     }
//   });

//   // Generate & Download Summary
//   generateSummary.addEventListener("click", async () => {
//     chrome.storage.local.get(["transcript", "start_time", "end_time"], async (data) => {
//       if (!data.transcript || data.transcript.trim() === "") {
//         alert("⚠ No transcript available for summarization.");
//         return;
//       }

//       try {
//         const date = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY format
//         const start_time = data.start_time || new Date().toLocaleTimeString();
//         const end_time = data.end_time || new Date().toLocaleTimeString();

//         const response = await fetch("http://localhost:5000/summarize", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ 
//             text: data.transcript,
//             date: date,
//             start_time: start_time,
//             end_time: end_time
//           }),
//         });

//         if (!response.ok) {
//           throw new Error("API request failed");
//         }

//         const result = await response.json();
//         downloadSummary(result.meeting_details);
//       } catch (error) {
//         console.error("Error generating summary:", error);
//         alert("⚠ Error generating summary. Check console logs.");
//       }
//     });
//   });

//   function downloadSummary(summary) {
//     const blob = new Blob([summary], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "meeting_summary.txt";
//     a.click();
//     URL.revokeObjectURL(url);
//   }
// });














document.addEventListener("DOMContentLoaded", () => {
  const startTranscription = document.getElementById("startTranscription");
  const stopTranscription = document.getElementById("stopTranscription");
  const generateSummary = document.getElementById("generateSummary");
  const statusText = document.getElementById("statusText");

  let startTime = null;
  let endTime = null;

  // Retrieve the current state from storage
  chrome.storage.local.get("isTranscribing", (data) => {
    if (data.isTranscribing) {
      startTranscription.disabled = true;
      stopTranscription.disabled = false;
      statusText.innerText = "Transcription Started...";
    } else {
      startTranscription.disabled = false;
      stopTranscription.disabled = true;
      statusText.innerText = "Ready";
    }
  });

  // Start Transcription
  startTranscription.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error("No active tab found.");

      // Ensure the content script is injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      // Send message to content script
      await chrome.tabs.sendMessage(tab.id, { type: "turnOnStream" });
      startTranscription.disabled = true;
      stopTranscription.disabled = false;
      statusText.innerText = "Transcription Started...";
      chrome.storage.local.set({ isTranscribing: true });

      // Set the start time to the current time
      startTime = new Date().toLocaleTimeString();
      chrome.storage.local.set({ start_time: startTime });
    } catch (error) {
      console.error("Error starting transcription:", error);
      alert("⚠ Error starting transcription. Please refresh the page and try again.");
    }
  });

  // Stop Transcription
  stopTranscription.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error("No active tab found.");

      // Send message to content script
      await chrome.tabs.sendMessage(tab.id, { type: "turnOffStream" });
      startTranscription.disabled = false;
      stopTranscription.disabled = true;
      generateSummary.disabled = false;
      statusText.innerText = "Transcription Stopped";
      chrome.storage.local.set({ isTranscribing: false });

      // Set the end time to the current time
      endTime = new Date().toLocaleTimeString();
      chrome.storage.local.set({ end_time: endTime });
    } catch (error) {
      console.error("Error stopping transcription:", error);
      alert("⚠ Error stopping transcription. Please refresh the page and try again.");
    }
  });

  // Generate & Download Summary
  generateSummary.addEventListener("click", async () => {
    chrome.storage.local.get(["transcript", "start_time", "end_time"], async (data) => {
      if (!data.transcript || data.transcript.trim() === "") {
        alert("⚠ No transcript available for summarization.");
        return;
      }

      try {
        const date = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY format
        const start_time = data.start_time || new Date().toLocaleTimeString();
        const end_time = data.end_time || new Date().toLocaleTimeString();

        const response = await fetch("http://localhost:5000/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: data.transcript,
            date: date,
            start_time: start_time,
            end_time: end_time
          }),
        });

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const result = await response.json();
        downloadSummary(result.pdf_data);
      } catch (error) {
        console.error("Error generating summary:", error);
        alert("⚠ Error generating summary. Check console logs.");
      }
    });
  });

  function downloadSummary(pdf_data) {
    // Convert the hex string to a Uint8Array
    const bytes = new Uint8Array(pdf_data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Agenda of Meeting.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }
});