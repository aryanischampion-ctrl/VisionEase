import json
import requests

from flask import Flask, jsonify, request
from flask_cors import CORS


# =========================================================
# VisionEase 2.0
# Flask + Ollama Local AI Backend
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# OLLAMA SETTINGS
# =========================================================

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "qwen2.5:0.5b"


# =========================================================
# SYSTEM PROMPT
# =========================================================

SYSTEM_PROMPT = """
You are VisionEase AI, a responsible digital reading-comfort
screening assistant.

Analyze the user's answers about reading comfort, screen time,
text size, contrast, symptoms, breaks, lighting, environment,
device, reading time, comprehension, and preferred settings.

Your responsibilities:

1. Identify reading-comfort patterns.
2. Identify possible digital eye-strain risk factors.
3. Generate practical personalized recommendations.
4. Recommend comfortable text size.
5. Recommend comfortable contrast.
6. Recommend suitable lighting.
7. Recommend a screen-break schedule.
8. Explain whether professional eye-care attention may be appropriate.

IMPORTANT SAFETY RULES:

- Do NOT diagnose diseases.
- Do NOT say the user has myopia, glaucoma, cataracts,
  retinal disease, or another medical condition.
- This is only a digital reading-comfort screening.
- If serious, persistent, severe, or worsening symptoms are
  reported, recommend professional eye-care attention.
- Use simple language.
- Do not invent information.
- Base the result only on the supplied assessment.
- Return ONLY valid JSON.
- Do not use Markdown.
"""


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "VisionEase AI backend is running",
        "ai_engine": "Ollama",
        "model": MODEL_NAME
    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():

    try:
        response = requests.get(
            "http://127.0.0.1:11434/api/tags",
            timeout=5
        )

        if response.ok:
            return jsonify({
                "success": True,
                "ollama": True,
                "model": MODEL_NAME
            })

        return jsonify({
            "success": False,
            "ollama": False,
            "error": "Ollama is not responding correctly."
        }), 503

    except Exception as error:
        return jsonify({
            "success": False,
            "ollama": False,
            "error": "Ollama is not running.",
            "details": str(error)
        }), 503


# =========================================================
# ANALYZE ASSESSMENT
# =========================================================

@app.route("/api/analyze", methods=["POST"])
def analyze_assessment():

    try:

        # -------------------------------------------------
        # RECEIVE JSON
        # -------------------------------------------------

        assessment_data = request.get_json(silent=True)

        if not assessment_data:
            return jsonify({
                "success": False,
                "error": "No assessment data received."
            }), 400

        print("\n========================================")
        print("VISIONEASE AI ANALYSIS")
        print("========================================")

        print("Assessment received:")
        print(json.dumps(assessment_data, indent=2))


        # -------------------------------------------------
        # USER PROMPT
        # -------------------------------------------------

        user_prompt = f"""
Analyze this VisionEase assessment.

ASSESSMENT DATA:

{json.dumps(assessment_data, indent=2)}

Return exactly this JSON structure:

{{
  "profile": "A short personalized reader profile",
  "score": 0,
  "level": "Low",
  "summary": "A simple personalized explanation",
  "risk_factors": [
    "Risk factor 1",
    "Risk factor 2"
  ],
  "recommendations": [
    "Personalized recommendation 1",
    "Personalized recommendation 2",
    "Personalized recommendation 3"
  ],
  "preferred_settings": {{
    "text_size": "Recommended text size",
    "contrast": "Recommended contrast",
    "lighting": "Recommended lighting",
    "break_schedule": "Recommended break schedule"
  }},
  "attention_level": "Routine self-care",
  "medical_guidance": "A short safety-focused explanation"
}}

STRICT RULES:

1. score must be an integer from 0 to 100.

2. level must be exactly:
   Low
   Moderate
   High

3. risk_factors must be an array of strings.

4. recommendations must be an array of strings.

5. preferred_settings must contain:
   text_size
   contrast
   lighting
   break_schedule

6. attention_level must be exactly one of:
   Routine self-care
   Consider an eye examination
   Seek prompt professional care

7. Do not diagnose any disease.

8. Base the result ONLY on the assessment data.

9. Return ONLY valid JSON.

10. Do not include Markdown.

11. Do not include ```json.

12. Do not include explanations outside the JSON.
"""


        # -------------------------------------------------
        # OLLAMA REQUEST
        # -------------------------------------------------

        ollama_payload = {
            "model": MODEL_NAME,
            "system": SYSTEM_PROMPT,
            "prompt": user_prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.3,
                "num_ctx": 4096
            }
        }

        print("\nSending request to Ollama...")


        response = requests.post(
            OLLAMA_URL,
            json=ollama_payload,
            timeout=120
        )


        print(
            "Ollama HTTP status:",
            response.status_code
        )


        # -------------------------------------------------
        # OLLAMA HTTP ERROR
        # -------------------------------------------------

        if not response.ok:

            print(
                "Ollama error:",
                response.text
            )

            return jsonify({
                "success": False,
                "error": "Ollama returned an error.",
                "details": response.text
            }), 502


        # -------------------------------------------------
        # READ OLLAMA RESPONSE
        # -------------------------------------------------

        ollama_result = response.json()

        raw_output = ollama_result.get(
            "response",
            ""
        )


        if not raw_output:

            return jsonify({
                "success": False,
                "error": "Ollama returned an empty AI response."
            }), 502


        print("\nRaw AI response:")
        print(raw_output)


        # -------------------------------------------------
        # CLEAN RESPONSE
        # -------------------------------------------------

        raw_output = raw_output.strip()

        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]

        elif raw_output.startswith("```"):
            raw_output = raw_output[3:]

        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]

        raw_output = raw_output.strip()


        # -------------------------------------------------
        # PARSE JSON
        # -------------------------------------------------

        try:

            result = json.loads(raw_output)

        except json.JSONDecodeError as error:

            print(
                "AI JSON parsing error:",
                repr(error)
            )

            print(
                "Invalid AI output:",
                raw_output
            )

            return jsonify({
                "success": False,
                "error": "The local AI returned invalid JSON.",
                "details": str(error),
                "raw_response": raw_output[:2000]
            }), 500


        # -------------------------------------------------
        # VALIDATE SCORE
        # -------------------------------------------------

        if "score" not in result:
            result["score"] = 50

        try:
            result["score"] = int(
                float(result["score"])
            )

        except Exception:
            result["score"] = 50

        result["score"] = max(
            0,
            min(
                100,
                result["score"]
            )
        )


        # -------------------------------------------------
        # VALIDATE LEVEL
        # -------------------------------------------------

        if result.get("level") not in [
            "Low",
            "Moderate",
            "High"
        ]:

            if result["score"] >= 80:
                result["level"] = "Low"

            elif result["score"] >= 50:
                result["level"] = "Moderate"

            else:
                result["level"] = "High"


        # -------------------------------------------------
        # DEFAULT PROFILE
        # -------------------------------------------------

        if not result.get("profile"):
            result["profile"] = "Personalized Reader"


        # -------------------------------------------------
        # DEFAULT SUMMARY
        # -------------------------------------------------

        if not result.get("summary"):
            result["summary"] = (
                "Your VisionEase reading-comfort "
                "assessment has been analyzed."
            )


        # -------------------------------------------------
        # RISK FACTORS
        # -------------------------------------------------

        if not isinstance(
            result.get("risk_factors"),
            list
        ):
            result["risk_factors"] = []


        # -------------------------------------------------
        # RECOMMENDATIONS
        # -------------------------------------------------

        if not isinstance(
            result.get("recommendations"),
            list
        ):
            result["recommendations"] = []


        # -------------------------------------------------
        # PREFERRED SETTINGS
        # -------------------------------------------------

        if not isinstance(
            result.get("preferred_settings"),
            dict
        ):
            result["preferred_settings"] = {}


        settings = result["preferred_settings"]


        if not settings.get("text_size"):
            settings["text_size"] = "20px"


        if not settings.get("contrast"):
            settings["contrast"] = "Normal"


        if not settings.get("lighting"):
            settings["lighting"] = (
                "Comfortable ambient lighting"
            )


        if not settings.get("break_schedule"):
            settings["break_schedule"] = (
                "Take regular screen breaks"
            )


        # -------------------------------------------------
        # ATTENTION LEVEL
        # -------------------------------------------------

        valid_attention_levels = [
            "Routine self-care",
            "Consider an eye examination",
            "Seek prompt professional care"
        ]

        if result.get("attention_level") not in valid_attention_levels:
            result["attention_level"] = "Routine self-care"


        # -------------------------------------------------
        # MEDICAL GUIDANCE
        # -------------------------------------------------

        if not result.get("medical_guidance"):

            result["medical_guidance"] = (
                "VisionEase is a comfort screening tool "
                "and does not diagnose medical conditions."
            )


        # -------------------------------------------------
        # FINAL RESULT
        # -------------------------------------------------

        final_result = {
            "success": True,
            "profile": result["profile"],
            "score": result["score"],
            "level": result["level"],
            "summary": result["summary"],
            "risk_factors": result["risk_factors"],
            "recommendations": result["recommendations"],
            "preferred_settings": settings,
            "attention_level": result["attention_level"],
            "medical_guidance": result["medical_guidance"]
        }


        print("\n========================================")
        print("VISIONEASE AI SUCCESS")
        print("========================================")

        print(
            json.dumps(
                final_result,
                indent=2
            )
        )


        return jsonify(final_result)


    # =====================================================
    # OLLAMA CONNECTION ERROR
    # =====================================================

    except requests.exceptions.ConnectionError:

        print(
            "ERROR: Cannot connect to Ollama."
        )

        return jsonify({
            "success": False,
            "error": "Cannot connect to Ollama.",
            "details": (
                "Make sure Ollama is running at "
                "http://127.0.0.1:11434"
            )
        }), 503


    # =====================================================
    # TIMEOUT
    # =====================================================

    except requests.exceptions.Timeout:

        print(
            "ERROR: Ollama request timed out."
        )

        return jsonify({
            "success": False,
            "error": "The local AI took too long to respond.",
            "details": (
                "Ollama timed out after 120 seconds."
            )
        }), 504


    # =====================================================
    # GENERAL ERROR
    # =====================================================

    except Exception as error:

        print("\n========================================")
        print("VISIONEASE BACKEND ERROR")
        print("========================================")

        print(repr(error))

        print("========================================")

        return jsonify({
            "success": False,
            "error": (
                "Unable to analyze the assessment right now."
            ),
            "details": str(error)
        }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )