// Declare transcriptText once at the top of the script
let transcriptText = "";

// Speech Recognition Setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

// Handle Transcription
recognition.onresult = (event) => {
  transcriptText = ""; // Reset transcriptText for new transcription
  for (let i = 0; i < event.results.length; i++) {
    transcriptText += event.results[i][0].transcript + " ";
  }
  chrome.storage.local.set({ transcript: transcriptText });
};

// Start & Stop Listening on Message from Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "turnOnStream") {
    recognition.start();
    sendResponse({ status: "streamingStarted" });
    chrome.runtime.sendMessage({ type: "updateTranscriptionState", isTranscribing: true });
  } else if (message.type === "turnOffStream") {
    recognition.stop();
    sendResponse({ status: "stopped" });
    chrome.runtime.sendMessage({ type: "updateTranscriptionState", isTranscribing: false });
  }
  return true; // Required for async sendResponse
});