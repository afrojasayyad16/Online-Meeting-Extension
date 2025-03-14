chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Meeting Transcription Extension Installed");
  chrome.storage.local.set({ isTranscribing: false });
});

// Listen for Messages
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "saveTranscript") {
    saveTranscript();
  } else if (message.type === "updateTranscriptionState") {
    chrome.storage.local.set({ isTranscribing: message.isTranscribing });
  }
});

// Save Transcription to Downloads
function saveTranscript() {
  chrome.storage.local.get("transcript", (data) => {
    if (!data.transcript || data.transcript.trim() === "") {
      console.warn("⚠ No transcript available to save.");
      return;
    }

    const textBlob = new Blob([data.transcript], { type: "text/plain" });
    const reader = new FileReader();

    reader.onloadend = function () {
      const textFile = reader.result;

      chrome.downloads.download({
        url: textFile,
        filename: "meeting_transcription.txt",
        saveAs: true,
      });

      console.log("✅ Transcript saved successfully.");
    };

    reader.readAsDataURL(textBlob);
  });
}