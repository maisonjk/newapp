# /home/ubuntu/christian_journal_app/src/main.py

from flask import Flask, request, jsonify, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import datetime
import speech_recognition as sr
import os
import requests # Added for Bible API

app = Flask(__name__)
# Secret key is needed for session management and Flask-Login
# In a real app, use a strong, environment-variable-based secret key
app.config["SECRET_KEY"] = "a_very_secret_key_for_dev_only"
# Temporary directory for uploaded audio files
app.config["UPLOAD_FOLDER"] = "/tmp/audio_uploads"

# Ensure upload directory exists
if not os.path.exists(app.config["UPLOAD_FOLDER"]):
    os.makedirs(app.config["UPLOAD_FOLDER"])

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "login" # Redirect to login page if user is not logged in

# --- User Management --- 

# In-memory storage for users (replace with database later)
users = {}
user_counter = 0

class User(UserMixin):
    def __init__(self, id, username, password_hash):
        self.id = id
        self.username = username
        self.password_hash = password_hash

@login_manager.user_loader
def load_user(user_id):
    return users.get(user_id)

@app.route("/register", methods=["POST"])
def register():
    global user_counter
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Missing username or password"}), 400

    username = data["username"]
    password = data["password"]

    # Check if username already exists
    if any(u.username == username for u in users.values()):
        return jsonify({"error": "Username already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    user_counter += 1
    user_id = str(user_counter)
    new_user = User(id=user_id, username=username, password_hash=hashed_password)
    users[user_id] = new_user

    # Automatically log in the user after registration
    login_user(new_user)
    return jsonify({"message": "User registered successfully", "user_id": user_id, "username": username}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Missing username or password"}), 400

    username = data["username"]
    password = data["password"]

    user = next((u for u in users.values() if u.username == username), None)

    if user and bcrypt.check_password_hash(user.password_hash, password):
        login_user(user)
        return jsonify({"message": "Login successful", "user_id": user.id, "username": user.username}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200

@app.route("/check_auth", methods=["GET"])
@login_required
def check_auth():
    # Endpoint to check if the user is currently logged in
    return jsonify({"logged_in": True, "user_id": current_user.id, "username": current_user.username}), 200

# --- Journal Entry Management --- 

# In-memory storage for journal entries (replace with database later)
# Store entries per user
journal_entries = {} # { user_id: { entry_id: entry_data } }
entry_counter = 0

@app.route("/entries", methods=["POST"])
@login_required
def create_entry():
    global entry_counter
    data = request.get_json()
    if not data or ("content" not in data and "transcribed_text" not in data): # Allow content or transcribed text
        return jsonify({"error": "Missing content or transcribed text"}), 400

    user_id = current_user.id
    if user_id not in journal_entries:
        journal_entries[user_id] = {}

    entry_counter += 1
    entry_id = str(entry_counter)
    content = data.get("content", data.get("transcribed_text", "")) # Prioritize direct content

    new_entry = {
        "id": entry_id,
        "user_id": user_id,
        "content": content,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "title": data.get("title", ""), # Optional title
        "tags": data.get("tags", []) # Optional tags
    }
    journal_entries[user_id][entry_id] = new_entry
    return jsonify(new_entry), 201

@app.route("/entries", methods=["GET"])
@login_required
def get_entries():
    user_id = current_user.id
    user_entries = journal_entries.get(user_id, {})
    # Return entries sorted by timestamp, newest first
    sorted_entries = sorted(user_entries.values(), key=lambda x: x["timestamp"], reverse=True)
    return jsonify(list(sorted_entries))

@app.route("/entries/<string:entry_id>", methods=["GET"])
@login_required
def get_entry(entry_id):
    user_id = current_user.id
    entry = journal_entries.get(user_id, {}).get(entry_id)
    if entry:
        return jsonify(entry)
    else:
        return jsonify({"error": "Entry not found or access denied"}), 404

# --- Voice Transcription --- 

@app.route("/transcribe", methods=["POST"])
@login_required
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file part"}), 400
    
    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file: # Add check for allowed extensions if needed
        # Save the file temporarily
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filepath)

        r = sr.Recognizer()
        text = ""
        try:
            # Assuming the uploaded file is in a format sr.AudioFile can handle (like WAV)
            with sr.AudioFile(filepath) as source:
                audio_data = r.record(source) # read the entire audio file
                # Use Google Web Speech API for recognition
                text = r.recognize_google(audio_data)
                print(f"Transcription: {text}") # Log transcription
        except sr.UnknownValueError:
            # Could not understand audio
            os.remove(filepath) # Clean up temp file
            return jsonify({"error": "Speech recognition could not understand audio"}), 400
        except sr.RequestError as e:
            # Could not request results from Google Speech Recognition service
            os.remove(filepath) # Clean up temp file
            return jsonify({"error": f"Could not request results from speech service; {e}"}), 503
        except Exception as e:
            # Other potential errors (e.g., file format)
            os.remove(filepath) # Clean up temp file
            return jsonify({"error": f"Transcription failed: {e}"}), 500
        finally:
             # Ensure cleanup even if transcription is successful but before returning
             if os.path.exists(filepath):
                 os.remove(filepath)

        return jsonify({"transcribed_text": text}), 200

    return jsonify({"error": "File processing failed"}), 500

# --- Bible API Integration --- 

BIBLE_API_URL = "https://bible-api.com/"

@app.route("/bible/<path:reference>", methods=["GET"])
@login_required
def get_scripture(reference):
    # Example reference: "John 3:16", "Romans 12:1-2"
    # Optional translation parameter, e.g., /bible/John 3:16?translation=kjv
    translation = request.args.get("translation", "web") # Default to World English Bible
    api_url = f"{BIBLE_API_URL}{reference}?translation={translation}"
    
    try:
        response = requests.get(api_url)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        # Check if the API returned an error within the JSON
        if "error" in data:
             return jsonify({"error": data["error"]}), 404 # Not found or invalid reference
        return jsonify(data) # Return the scripture data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Bible API: {e}")
        return jsonify({"error": "Failed to fetch scripture from external API"}), 503
    except Exception as e:
        print(f"Error processing Bible API response: {e}")
        return jsonify({"error": "Failed to process scripture data"}), 500

# --- Legacy Feature --- 

# In-memory storage for legacy entries (replace with database later)
legacy_entries = {} # { user_id: { entry_id: entry_data } }
legacy_entry_counter = 0

@app.route("/legacy_entries", methods=["POST"])
@login_required
def create_legacy_entry():
    global legacy_entry_counter
    data = request.get_json()
    # Legacy entries might just be text, or could include references to media (not implemented yet)
    if not data or "message" not in data:
        return jsonify({"error": "Missing message content"}), 400

    user_id = current_user.id
    if user_id not in legacy_entries:
        legacy_entries[user_id] = {}

    legacy_entry_counter += 1
    entry_id = f"L{legacy_entry_counter}" # Prefix to distinguish from regular entries
    
    new_legacy_entry = {
        "id": entry_id,
        "user_id": user_id,
        "message": data["message"],
        "recipient": data.get("recipient", "Future Generations"), # Optional recipient
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "title": data.get("title", "Legacy Message"), 
        # Placeholder for media links (e.g., photo_url, audio_url)
        "media": data.get("media", []) 
    }
    legacy_entries[user_id][entry_id] = new_legacy_entry
    return jsonify(new_legacy_entry), 201

@app.route("/legacy_entries", methods=["GET"])
@login_required
def get_legacy_entries():
    user_id = current_user.id
    user_legacy_entries = legacy_entries.get(user_id, {})
    # Return entries sorted by timestamp, newest first
    sorted_entries = sorted(user_legacy_entries.values(), key=lambda x: x["timestamp"], reverse=True)
    return jsonify(list(sorted_entries))

@app.route("/legacy_entries/<string:entry_id>", methods=["GET"])
@login_required
def get_legacy_entry(entry_id):
    user_id = current_user.id
    entry = legacy_entries.get(user_id, {}).get(entry_id)
    if entry:
        return jsonify(entry)
    else:
        return jsonify({"error": "Legacy entry not found or access denied"}), 404

# Basic route to check if the server is running
@app.route("/")
def index():
    return "Christian Journal Backend is running!"

if __name__ == "__main__":
    # Listen on all interfaces, important for deployment/exposure
    app.run(host="0.0.0.0", port=5000, debug=True)

