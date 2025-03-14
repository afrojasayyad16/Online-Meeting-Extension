# Generate-Live-Summary
### Project Description 
The name of my project is AI-Powered Online Meeting Agenda Generator. The main objective of this project is to automate the process of generating the agenda of online meetings. The project is developed using React.js for frontend, Node.js for backend, and Python for creating the Summarization module. The project is integrated with platforms like Google Meet, Zoom, and MS Teams. The project captures the transcripts of the meeting and generates a PDF file of the agenda of the meeting along with a suitable title, date, meeting's start and end time. The project uses Gemini's gemini-2.0-pro-exp-02-05 model for creating the Summarization module. The project is a browser extension that is able to create the agenda of the meeting in a systematic way, reducing manual efforts of note-taking, which is a time-consuming and tedious process. The project helps participants automate the note-taking task, thereby eliminating manual intervention and saving time effectively.

- #### Download the following pre-trained English model files and paste them into the root directory <br />
     [deepspeech-0.9.3-models.pbmm](https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm)</br>
     [deepspeech-0.9.3-models.scorer](https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer) 

### Install following dependencies 

 ```bash
     npm install
     pip install flask-cors
     pip install google-generativeai
     pip install reportlab
 ```

- #### Start development server

 ```bash
     npm run start-dev
 ```
