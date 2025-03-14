from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
import os

app = Flask(__name__)
CORS(app)  # Allows the Chrome extension to access the API

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def draw_wrapped_text(pdf, text, x, y, width, font_name, font_size):
    """Draw wrapped text within a specified width."""
    pdf.setFont(font_name, font_size)
    lines = []
    words = text.split()
    current_line = words[0]
    for word in words[1:]:
        if pdf.stringWidth(current_line + " " + word, font_name, font_size) < width:
            current_line += " " + word
        else:
            lines.append(current_line)
            current_line = word
    lines.append(current_line)
    
    for line in lines:
        pdf.drawString(x, y, line)
        y -= 15  # Move to the next line
    return y

def create_pdf(meeting_details):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setFont("Helvetica", 12)  # Default font

    # Split the meeting details into sections
    sections = meeting_details.split("\n\n")

    # Starting position for the text
    x = 50
    y = 750

    for section in sections:
        if section.startswith("<b>"):
            # Bold the field names
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(x, y, section.replace("<b>", "").replace("</b>", ""))
            y -= 15  # Move to the next line
        else:
            # Normal text for the content
            y = draw_wrapped_text(pdf, section, x, y, 500, "Helvetica", 12)
        y -= 15  # Add extra space between sections

    pdf.save()
    buffer.seek(0)
    return buffer

@app.route("/summarize", methods=["POST"])
def summarize_text():
    data = request.json
    transcript = data.get("text", "")
    date = data.get("date", datetime.now().strftime("%d/%m/%Y"))  # Updated date format
    start_time = data.get("start_time", datetime.now().strftime("%I:%M:%S %p"))
    end_time = data.get("end_time", datetime.now().strftime("%I:%M:%S %p"))
     
    print("📥 Received text:", transcript)  # Debugging log

    if not transcript:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Use Gemini to generate a summary and title
        model = genai.GenerativeModel('gemini-2.0-pro-exp-02-05')
        
        # Generate a structured summary with Main Content maximized to ~70% of the transcript
        summary_response = model.generate_content(
            f"Summarize this text in the following format without using asterisks or any additional descriptions:\n\n"
            f"Introduction - Provide a brief introduction to the topic (10-15% of the content).\n"
            f"Main Content - Highlight the key points and main ideas in detail (70% of the content).\n"
            f"Conclusion - Summarize the overall conclusion or takeaways (10-15% of the content).\n\n"
            f"Text: {transcript}"
        )
        summarized_text = summary_response.text.replace("**", "")  # Remove asterisks
        
        # Generate a single title without multiple options
        title_response = model.generate_content(
            f"Create one concise and accurate title for this text, strictly within 4-6 words, and do not provide any additional options or descriptions: {transcript}"
        )
        title = title_response.text.strip().replace("*", "")  # Remove asterisks
        
        # Format the meeting details with extra lines between fields and bold fields using HTML tags
        meeting_details = (
            f"<b>Title of meeting:</b> {title}\n\n"
            f"<b>Date:</b> {date}\n\n"
            f"<b>Start time:</b> {start_time}\n\n"
            f"<b>End time:</b> {end_time}\n\n"
            f"<b>Agenda of meeting:</b>\n\n{summarized_text}"
        )
        
        # Create a PDF file
        pdf_buffer = create_pdf(meeting_details)
        pdf_data = pdf_buffer.getvalue()
        pdf_buffer.close()

        # Return the PDF file as a response
        return jsonify({"pdf_data": pdf_data.hex()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)















