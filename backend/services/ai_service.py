import os
import base64
from typing import List, Optional
from openai import OpenAI

# Initialize OpenAI Client
api_key = os.getenv("OPENAI_API_KEY")
client = None
if api_key:
    client = OpenAI(api_key=api_key)

def encode_image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def generate_prescription_summary(diagnosis: str, medicines: List[dict], notes: str) -> str:
    """
    Generates a patient-friendly summary of a written prescription.
    """
    if not client:
        return generate_mock_summary(diagnosis, medicines, notes)

    try:
        meds_text = "\n".join([
            f"- {m.get('medicine_name')} ({m.get('dosage') or 'As directed'}): Take {m.get('frequency') or 'once daily'} for {m.get('duration') or 'specified days'}. Instructions: {m.get('instructions') or 'None'}"
            for m in medicines
        ])
        
        prompt = (
            f"You are a compassionate healthcare AI assistant. Please summarize the following prescription details in simple, warm, patient-friendly terms:\n\n"
            f"Diagnosis: {diagnosis or 'Not specified'}\n"
            f"Clinical Notes: {notes or 'None'}\n"
            f"Prescribed Medications:\n{meds_text or 'No medications listed'}\n\n"
            f"Provide a clear, easy-to-read explanation (under 150 words) telling the patient what this diagnosis means, "
            f"what they need to do, how they should take their medicines, and any general care advice. Keep it concise.\n"
            f"CRITICAL: Do not use markdown bold formatting (like double asterisks '**') or bullet points using asterisks in your response. "
            f"Write in clean text with simple UPPERCASE headers (e.g. DIAGNOSIS CARE PLAN:, MEDICATION INSTRUCTIONS:) and hyphen bullets."
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a warm, professional clinical AI assistant helping patients understand their prescriptions. Do not use any double asterisks markdown bolding (**)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI prescription summary: {e}")
        return generate_mock_summary(diagnosis, medicines, notes)

def generate_image_prescription_summary(image_path: str) -> str:
    """
    Generates an explanation/transcription of an uploaded prescription photo or PDF.
    """
    if not client:
        return "Simulated AI analysis of uploaded prescription photo:\n\n- The prescription document has been scanned.\n- Identified diagnosis: Mild upper respiratory infection / Seasonal Allergies.\n- Prescribed: Antihistamines and saline nasal spray to alleviate congestion.\n- Instructions: Take daily before sleeping. Drink plenty of water and rest."

    try:
        base64_image = encode_image_to_base64(image_path)
        
        # Determine content type based on extension
        ext = os.path.splitext(image_path)[1].lower()
        mime_type = "image/jpeg"
        if ext == ".png":
            mime_type = "image/png"
        elif ext == ".gif":
            mime_type = "image/gif"
        elif ext == ".webp":
            mime_type = "image/webp"

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert clinical AI assisting a patient in deciphering their hand-written prescription or medical notes. Translate complex terminology and handwriting into clear patient instructions. Do not use any double asterisks markdown bolding (**)."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Please analyze this prescription image. Transcribe the handwriting if possible, list the medicines, dosage, and explain in simple terms what the patient should do and how they should manage their care. CRITICAL: Do not use markdown bold formatting (like double asterisks '**') or bullet points using asterisks in your response. Write in clean text."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=400,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI image vision summary: {e}")
        return "The AI was unable to process the prescription image file. Please check if the file format is supported (JPEG, PNG, WEBP) and readable."

def generate_mock_summary(diagnosis: str, medicines: List[dict], notes: str) -> str:
    """
    Fallback mock summary when OpenAI API is not configured/available.
    """
    summary = f"Patient Care Plan & Explanation:\n\n"
    if diagnosis:
        summary += f"• Concerning your diagnosis ({diagnosis}): This is a manageable medical condition. Please follow the instructions closely.\n"
    else:
        summary += f"• Medical Advice: Please follow the general guidelines below.\n"

    if medicines:
        summary += "\n• Medication Schedule:\n"
        for m in medicines:
            med_name = m.get("medicine_name", "Medication")
            dosage = m.get("dosage") or "As directed"
            freq = m.get("frequency") or "once daily"
            dur = m.get("duration") or "the full course"
            inst = m.get("instructions") or "Take as directed by pharmacist"
            summary += f"  - {med_name} ({dosage}): Take {freq} for {dur}. Note: {inst}\n"
    
    if notes:
        summary += f"\n• Doctor's Notes: {notes}\n"
        
    summary += "\n• General Care: Stay hydrated, get plenty of rest, and contact the clinic immediately if you experience severe symptoms or side effects."
    return summary
