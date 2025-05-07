# Christian Digital Journal App ("Walk With God")

This project implements a Christian digital journal application with both a web interface (React) and a mobile interface (React Native), supported by a Flask backend.

## Features Implemented

*   **User Authentication:** Secure registration and login.
*   **Journal Entries:** Create text-based journal entries with optional titles and tags.
*   **Voice-to-Text:** Record voice notes within the web app, which are transcribed and added to the journal entry content (uses Google Web Speech API via `SpeechRecognition` library).
*   **Bible Lookup:** Fetch and display Bible scripture passages using the `bible-api.com` public API (supports WEB, KJV, BBE translations).
*   **Legacy Messages:** Create and view special messages intended for future generations or personal reflection.
*   **Web Application:** React frontend providing access to all features.
*   **Mobile Application:** React Native frontend providing access to authentication and placeholder/basic implementations for Journal, Bible, and Legacy features.
*   **Backend API:** Flask backend serving both web and mobile applications.

## Backend Deployment

The Flask backend has been permanently deployed and is accessible at:
**https://48xhpiqc0ddd.manus.space**

*Note: This backend uses in-memory storage for users and entries. Data will be lost upon server restart. For persistent storage, a database integration (e.g., MySQL, PostgreSQL) would be required.* 

## Source Code

The complete source code for the backend, web frontend, and mobile app is provided in the attached zip files:
*   `christian_journal_app_backend_src.zip`: Contains the Flask backend source (`src/main.py` and `requirements.txt`).
*   `christian_journal_app_web_frontend.zip`: Contains the React web application source code.
*   `christian_journal_app_mobile_app.zip`: Contains the React Native mobile application source code.

## Running Locally

### Backend (Flask)

1.  Unzip `christian_journal_app_backend_src.zip`.
2.  Navigate to the directory containing `src` and `requirements.txt`.
3.  Create a Python virtual environment: `python3 -m venv venv`
4.  Activate the virtual environment: `source venv/bin/activate` (Linux/macOS) or `venv\Scripts\activate` (Windows).
5.  Install dependencies: `pip install -r requirements.txt`
6.  Run the backend: `python src/main.py`
    *   The backend will run on `http://localhost:5000`.

### Web Frontend (React)

1.  Unzip `christian_journal_app_web_frontend.zip`.
2.  Navigate into the `web_frontend` directory.
3.  Install dependencies: `npm install`
4.  Start the development server: `npm start`
    *   The web app will open in your browser, likely at `http://localhost:3000`. It is configured to proxy API requests to `http://localhost:5000` (the backend).

### Mobile App (React Native)

1.  Unzip `christian_journal_app_mobile_app.zip`.
2.  Navigate into the `mobile_app` directory.
3.  Install dependencies: `npm install`
4.  Follow the React Native environment setup guide for your specific development OS and target platform (iOS/Android): [https://reactnative.dev/docs/environment-setup](https://reactnative.dev/docs/environment-setup)
5.  Update the `API_URL` constant in the screen/component files (e.g., `src/screens/LoginScreen.js`) to point to your backend's IP address accessible from your emulator/device (e.g., your computer's local network IP if running the backend locally).
6.  Run the app on an emulator or device:
    *   For Android: `npx react-native run-android`
    *   For iOS: `npx react-native run-ios`

## Further Development Notes

*   **Persistence:** Implement a database (like MySQL or PostgreSQL) for the backend to store users and entries permanently.
*   **Mobile Features:** Fully implement the Journal, Bible, and Legacy features in the React Native app, including voice recording (requires libraries like `react-native-voice` or `expo-av` and platform-specific permissions).
*   **Authentication:** Implement proper session/token handling (e.g., using JWT or session cookies managed with `axios` `withCredentials` and backend session management) for both web and mobile, including persistent login state on mobile using `AsyncStorage` or `SecureStore`.
*   **Error Handling:** Enhance error handling and user feedback on both frontends.
*   **Styling:** Apply the desired clean/sleek design inspired by brandeins.de more thoroughly across both applications.
*   **Deployment:** The React frontend can be built (`npm run build`) and deployed as a static site. The Flask backend deployment might require a production WSGI server (like Gunicorn or uWSGI) behind a reverse proxy (like Nginx) for better performance and security in a real production scenario.

