import { createServer } from "http";
import socketIO from "socket.io";
import { Model } from "deepspeech";

let DEEPSPEECH_MODEL = __dirname + "/deepspeech-0.9.3-models"; // path to deepspeech english model directory

const SERVER_PORT = 4000; // websocket server port

function createModel(modelDir) {
  let modelPath = modelDir + ".pbmm";
  let scorerPath = modelDir + ".scorer";
  let model = new Model(modelPath);
  model.enableExternalScorer(scorerPath);
  return model;
}

let englishModel = createModel(DEEPSPEECH_MODEL);

let modelStream;
let recordedChunks = 0;
let endInterval = null;
let silenceBuffers = [];
let firstTime = true;

function processAudioStream(data, callback) {
  processVoice(data);

  if (firstTime) {
    endInterval = setInterval(function () {
      let results = intermediateDecode();
      if (results && callback) callback(results);
    }, 500);
    firstTime = false;
  }
}

function endAudioStream(callback) {
  console.log("[end]");
  let results = intermediateDecode();

  if (results && callback) callback(results);
}

function endConnection() {
  console.log("[end connection]");

  if (endInterval) clearInterval(endInterval);
  if (modelStream) modelStream.finishStream(); // ignore results

  endInterval = null;
  firstTime = true;
  recordedChunks = 0;
  modelStream = null;
}

function resetAudioStream() {
  console.log("[reset]");

  clearTimeout(endInterval);
  createStream(); // ignore results

  firstTime = true;
  recordedChunks = 0;
  silenceStart = null;
}

function addBufferedSilence(data) {
  let audioBuffer;
  if (silenceBuffers.length) {
    silenceBuffers.push(data);
    let length = 0;
    silenceBuffers.forEach(function (buf) {
      length += buf.length;
    });
    audioBuffer = Buffer.concat(silenceBuffers, length);
    silenceBuffers = [];
  } else audioBuffer = data;
  return audioBuffer;
}

function processVoice(data, callback) {
  silenceStart = null;

  if (recordedChunks === 0) {
    console.log("");
    process.stdout.write("[start]"); // recording started
  } else process.stdout.write("="); // still recording

  recordedChunks++;

  data = addBufferedSilence(data);
  feedAudioContent(data);
}

function createStream() {
  modelStream = englishModel.createStream();
  recordedChunks = 0;
}

function intermediateDecode() {
  let results;

  if (modelStream) {
    let text = modelStream.intermediateDecode();
    if (text) {
      console.log("\nRecognized Text:", text);
      results = {
        text,
      };
    }
  }

  return results;
}

function feedAudioContent(chunk) {
  modelStream.feedAudioContent(chunk);
}

const app = createServer(function (req, res) {
  res.writeHead(200);
  res.write("generate-transcription");
  res.end();
});

// Initialize Socket.io with proper CORS handling
const io = socketIO(app, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

// Alternative CORS Fix (If needed)
io.engine.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

io.on("connection", function (socket) {
  console.log("client connected");

  socket.once("disconnect", () => {
    console.log("client disconnected");
    endConnection();
  });

  createStream();

  socket.on("stream-data", function (data) {
    processAudioStream(data, (results) => {
      socket.emit("recognize", results);
    });
  });

  socket.on("stream-end", function () {
    endAudioStream((results) => {
      socket.emit("recognize", results);
    });
  });

  socket.on("stream-reset", function () {
    resetAudioStream();
  });
});

app.listen(SERVER_PORT, "localhost", () => {
  console.log("Socket server listening on:", SERVER_PORT);
});

export default app;






// const http = require("http");
// const socketIO = require("socket.io");
// const DeepSpeech = require("deepspeech");

// let DEEPSPEECH_MODEL = __dirname + "/deepspeech-0.9.3-models"; // path to deepspeech english model directory

// const SERVER_PORT = 4000; // websocket server port

// function createModel(modelDir) {
//   let modelPath = modelDir + ".pbmm";
//   let scorerPath = modelDir + ".scorer";
//   let model = new DeepSpeech.Model(modelPath);
//   model.enableExternalScorer(scorerPath);
//   return model;
// }

// let englishModel = createModel(DEEPSPEECH_MODEL);

// let modelStream;
// let recordedChunks = 0;
// let endInterval = null;
// let silenceBuffers = [];
// let firstTime = true;

// function processAudioStream(data, callback) {
//   processVoice(data);

//   if (firstTime) {
//     endInterval = setInterval(function () {
//       let results = intermediateDecode();
//       if (results && callback) callback(results);
//     }, 500);
//     firstTime = false;
//   }
// }

// function endAudioStream(callback) {
//   console.log("[end]");
//   let results = intermediateDecode();

//   if (results && callback) callback(results);
// }

// function endConnection() {
//   console.log("[end connection]");

//   if (endInterval) clearInterval(endInterval);
//   if (modelStream) modelStream.finishStream(); // ignore results

//   endInterval = null;
//   firstTime = true;
//   recordedChunks = 0;
//   modelStream = null;
// }

// function resetAudioStream() {
//   console.log("[reset]");

//   clearTimeout(endInterval);
//   createStream(); // ignore results

//   firstTime = true;
//   recordedChunks = 0;
//   silenceStart = null;
// }

// function addBufferedSilence(data) {
//   let audioBuffer;
//   if (silenceBuffers.length) {
//     silenceBuffers.push(data);
//     let length = 0;
//     silenceBuffers.forEach(function (buf) {
//       length += buf.length;
//     });
//     audioBuffer = Buffer.concat(silenceBuffers, length);
//     silenceBuffers = [];
//   } else audioBuffer = data;
//   return audioBuffer;
// }

// function processVoice(data, callback) {
//   silenceStart = null;

//   if (recordedChunks === 0) {
//     console.log("");
//     process.stdout.write("[start]"); // recording started
//   } else process.stdout.write("="); // still recording

//   recordedChunks++;

//   data = addBufferedSilence(data);
//   feedAudioContent(data);
// }

// function createStream() {
//   modelStream = englishModel.createStream();
//   recordedChunks = 0;
// }

// function intermediateDecode() {
//   let results;

//   if (modelStream) {
//     let text = modelStream.intermediateDecode();
//     if (text) {
//       console.log("\nRecognized Text:", text);
//       results = {
//         text,
//       };
//     }
//   }

//   return results;
// }

// function feedAudioContent(chunk) {
//   modelStream.feedAudioContent(chunk);
// }

// const app = http.createServer(function (req, res) {
//   res.writeHead(200);
//   res.write("generate-transcription");
//   res.end();
// });

// // Initialize Socket.io with proper CORS handling
// const io = socketIO(app, {
//   cors: {
//     origin: "*", // Allow all origins
//     methods: ["GET", "POST"]
//   }
// });

// // Alternative CORS Fix (If needed)
// io.engine.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });

// io.on("connection", function (socket) {
//   console.log("client connected");

//   socket.once("disconnect", () => {
//     console.log("client disconnected");
//     endConnection();
//   });

//   createStream();

//   socket.on("stream-data", function (data) {
//     processAudioStream(data, (results) => {
//       socket.emit("recognize", results);
//     });
//   });

//   socket.on("stream-end", function () {
//     endAudioStream((results) => {
//       socket.emit("recognize", results);
//     });
//   });

//   socket.on("stream-reset", function () {
//     resetAudioStream();
//   });
// });

// app.listen(SERVER_PORT, "localhost", () => {
//   console.log("Socket server listening on:", SERVER_PORT);
// });

// module.exports = app;
