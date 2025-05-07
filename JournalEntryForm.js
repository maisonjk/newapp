// /home/ubuntu/christian_journal_app/web_frontend/src/components/JournalEntryForm.js
import React, { useState, useRef } from "react";
import axios from "axios";

function JournalEntryForm({ onNewEntry }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState(""); // Simple comma-separated tags for now
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleTextSubmit = async (event) => {
        event.preventDefault();
        if (!content.trim()) {
            setError("Content cannot be empty.");
            return;
        }
        await submitEntry({ title, content, tags: tags.split(",").map(t => t.trim()).filter(t => t) });
    };

    const submitEntry = async (entryData) => {
        setError("");
        setLoading(true);
        try {
            const response = await axios.post("/api/entries", entryData);
            console.log("Entry created:", response.data);
            if (onNewEntry) {
                onNewEntry(response.data); // Notify parent component (e.g., Dashboard)
            }
            // Clear form
            setTitle("");
            setContent("");
            setTags("");
        } catch (err) {
            console.error("Error creating entry:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Failed to save entry.");
        } finally {
            setLoading(false);
        }
    };

    // --- Voice Recording Logic --- 
    const startRecording = async () => {
        setError("");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" }); // Specify WAV type
                    // Stop the tracks to release the microphone
                    stream.getTracks().forEach(track => track.stop());
                    await transcribeAudio(audioBlob);
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                setError("Could not access microphone. Please check permissions.");
            }
        } else {
            setError("Audio recording is not supported by your browser.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Transcription will be triggered by onstop event
        }
    };

    const transcribeAudio = async (audioBlob) => {
        setTranscribing(true);
        setError("");
        const formData = new FormData();
        // Use a consistent filename, backend handles temp storage
        formData.append("audio", audioBlob, "recording.wav"); 

        try {
            const response = await axios.post("/api/transcribe", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Transcription result:", response.data);
            // Add transcribed text to the content field, allowing user to edit/add
            setContent(prevContent => prevContent + (prevContent ? "\n\n" : "") + response.data.transcribed_text);
        } catch (err) {
            console.error("Transcription error:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Transcription failed.");
        } finally {
            setTranscribing(false);
        }
    };

    return (
        <div style={{ border: "1px solid #eee", padding: "15px", marginTop: "20px" }}>
            <h3>Create New Journal Entry</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            {/* Text Input Form */}
            <form onSubmit={handleTextSubmit}>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="title">Title (Optional):</label><br />
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "95%" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="content">Content:</label><br />
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={6}
                        style={{ width: "95%" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="tags">Tags (Optional, comma-separated):</label><br />
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        style={{ width: "95%" }}
                    />
                </div>
                <button type="submit" disabled={loading || isRecording || transcribing}>
                    {loading ? "Saving..." : "Save Entry"}
                </button>
            </form>

            {/* Voice Input Section */}
            <div style={{ marginTop: "20px", paddingTop: "10px", borderTop: "1px solid #eee" }}>
                <h4>Or Record Your Thoughts</h4>
                <button onClick={startRecording} disabled={isRecording || transcribing}>
                    Start Recording
                </button>
                <button onClick={stopRecording} disabled={!isRecording || transcribing} style={{ marginLeft: "10px" }}>
                    Stop Recording
                </button>
                {isRecording && <p style={{ color: "blue" }}>Recording...</p>}
                {transcribing && <p style={{ color: "orange" }}>Transcribing audio...</p>}
            </div>
        </div>
    );
}

export default JournalEntryForm;

