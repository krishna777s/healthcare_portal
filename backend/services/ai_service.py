import os
import base64
from typing import List, Optional
from dotenv import load_dotenv
from openai import OpenAI

# Initialize OpenAI Client
load_dotenv()
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

def generate_soap_notes(keywords: str) -> str:
    if not client:
        return (
            "DIAGNOSIS CARE PLAN (SOAP Note - Mock):\n\n"
            "SUBJECTIVE:\n"
            f"- Patient reports symptoms described as: {keywords or 'No details specified'}.\n"
            "- Feeling fatigued and experiencing mild physical discomfort.\n\n"
            "OBJECTIVE:\n"
            "- Vital signs within normal parameters except slightly elevated blood pressure.\n"
            "- General examination shows alert, oriented, in no acute distress.\n\n"
            "ASSESSMENT:\n"
            "- Symptomatic presentation consistent with acute clinical stress or mild seasonal illness.\n\n"
            "PLAN:\n"
            "- Recommend symptomatic relief (adequate hydration, rest).\n"
            "- Follow-up in 3-5 days if symptoms persist or worsen."
        )
    try:
        prompt = (
            f"You are a professional clinical scribe. Please convert the following raw medical notes or keywords "
            f"into a structured clinical SOAP (Subjective, Objective, Assessment, Plan) note format:\n\n"
            f"Keywords: {keywords}\n\n"
            f"Output clean text without double asterisks markdown bolding. Use clear UPPERCASE headers for "
            f"SUBJECTIVE:, OBJECTIVE:, ASSESSMENT:, and PLAN:."
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional clinical assistant that writes clear SOAP notes. Do not use double asterisks bolding (**)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI generate_soap_notes: {e}")
        return f"Error generating SOAP notes. Fallback summary of symptoms: {keywords}"

def summarize_medical_report(report_name: str, report_type: str, notes: str, priority: str, is_patient: bool) -> str:
    if not client:
        if is_patient:
            return (
                f"PATIENT-FRIENDLY SUMMARY OF {report_name.upper()}:\n"
                f"- This is a {report_type.replace('_', ' ')} report requested with {priority} priority.\n"
                f"- Details: {notes or 'No abnormal values reported'}.\n"
                "- What this means: The results indicate a typical medical check. There is no cause for immediate alarm. "
                "Please continue with regular wellness monitoring and consult your doctor at your next visit."
            )
        else:
            return (
                f"CLINICAL BRIEF OF {report_name.upper()} ({report_type.upper()}):\n"
                f"- Priority: {priority.upper()}\n"
                f"- Findings: {notes or 'No notes provided'}.\n"
                "- Assessment: Normal clinical findings. Action: File under standard record and monitor as necessary."
            )
    try:
        role_prompt = (
            "Write in simple, comforting layperson terms. Explain medical words simply, avoid jargon, and tell them what they should do next."
            if is_patient else
            "Write in professional clinical brief style. Highlight abnormal values, diagnostic findings, and relevant clinical actions."
        )
        prompt = (
            f"Please summarize this medical lab report based on the following metadata:\n\n"
            f"Report Name: {report_name}\n"
            f"Report Type: {report_type}\n"
            f"Priority: {priority}\n"
            f"Clinical Notes: {notes or 'None'}\n\n"
            f"Tone/Audience: {role_prompt}\n\n"
            f"Output clean text without double asterisks markdown bolding."
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant summarizing reports. Do not use double asterisks bolding (**)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI summarize_medical_report: {e}")
        return f"Summary of {report_name}: {notes}"

def analyze_patient_history(timeline_summary: str) -> str:
    if not client:
        return (
            "AI PATIENT HISTORY INSIGHTS (Mock Analysis):\n\n"
            "- Trend: Patient shows recurrent consultations for standard ailments over the last timeline. "
            "Medications appear consistently managed.\n"
            "- Highlights: No critical chronic patterns detected. Keep monitoring blood pressure if recorded.\n"
            "- Care Advice: Ensure patient schedules routine check-ups and adheres to ongoing prescriptions."
        )
    try:
        prompt = (
            f"You are a clinical analyst. Here is a timeline summary of a patient's history "
            f"(appointments, prescriptions, admissions, lab reports):\n\n"
            f"{timeline_summary}\n\n"
            f"Please analyze this timeline to identify:\n"
            f"1. Chronic or recurring clinical trends.\n"
            f"2. Patient compliance or frequency of visits.\n"
            f"3. Key alerts or recommendations for the clinical staff.\n\n"
            f"Provide a concise summary under 200 words. Output clean text without double asterisks markdown bolding."
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert clinical history analyst. Do not use double asterisks bolding (**)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.4
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI analyze_patient_history: {e}")
        return "Unable to analyze history due to technical reasons. Please review the raw timeline events."

def get_treatment_recommendations(diagnosis: str, history_context: str) -> str:
    if not client:
        return (
            f"AI TREATMENT GUIDELINES (Mock recommendations for {diagnosis or 'Unspecified'}):\n\n"
            "- Standard Medications: Consider standard first-line therapies based on clinical history.\n"
            "- Contraindications: Verify patient has no history of drug allergies or conflicting medication.\n"
            "- Lifestyle: Recommend lifestyle modifications (nutrition, moderate exercise, stress relief).\n"
            "- Monitoring: Suggest scheduling a follow-up assessment in 7-14 days to monitor response."
        )
    try:
        prompt = (
            f"You are a clinical decision support advisor. Provide treatment recommendations based on standard medical guidelines for:\n"
            f"Diagnosis: {diagnosis}\n"
            f"Patient History Context: {history_context or 'No prior records'}\n\n"
            f"Include standard drug classes, lifestyle recommendations, follow-up timelines, and important alerts (e.g. checks for drug-drug interactions).\n"
            f"CRITICAL: Keep this strictly advisory for the medical practitioner. Output clean text without double asterisks markdown bolding."
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a clinical decision support AI assistant. Do not use double asterisks bolding (**)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI get_treatment_recommendations: {e}")
        return f"Standard guidelines recommend consultation and diagnostic follow-up for {diagnosis}."

def generate_copilot_response(messages: list, role: str, context_info: str) -> str:
    if not client:
        return (
            f"Hello! As your Clinical AI Copilot (Mock Assistant for {role}), "
            "I'm here to help. I see you are accessing the portal. "
            "Since the live OpenAI service connection is simulated, here is some quick guidance: "
            "make sure to log records clearly and check prescription details. How else can I assist you today?"
        )
    try:
        system_instructions = (
            f"You are a compassionate, professional Healthcare AI Copilot. The logged-in user is a {role}.\n"
            f"Here is current context or selection detail (patient/system info): {context_info or 'None'}.\n\n"
            f"Tailor your response to this user:\n"
            f"- If patient: Speak in clear, warm, plain language. Explain diagnoses, prescriptions, and health terms simply.\n"
            f"- If doctor: Act as a clinical advisor. Speak professionally, reference diagnostic terms, drug interactions, and clinical guidelines.\n"
            f"- If hospital_admin or admin: Speak professionally, focusing on hospital logistics, data entry, reports, or workflow management.\n"
            f"- If pharmacy/pharmacist: Speak professionally, focusing on medication names, dosage instructions, and dispensing details.\n\n"
            f"Do not use double asterisks bolding (**). Keep answers concise and direct."
        )
        formatted_messages = [{"role": "system", "content": system_instructions}]
        for msg in messages:
            formatted_messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=formatted_messages,
            max_tokens=400,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI generate_copilot_response: {e}")
        return "I am experiencing difficulty connecting to the medical AI service. Please try again in a few moments."

