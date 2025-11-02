````md
# Multilingual Chat Application — Frontend (React)

This is the **frontend interface** for the Multilingual Smart Chat App.  
It provides real-time multilingual chatting, voice message exchange, translation,  
and live presence status using React and WebSocket.

---

## Features

- Multilingual Chat Interface  
- Voice Message Recording and Playback  
- Real-time Messaging via WebSocket  
- Online/Offline Status  
- Automatic Translation and Grammar Correction  
- Voice/Video Call Signaling Integration  
- Responsive UI  

---

## Tech Stack

| Component | Technology |
|------------|-------------|
| Framework | React.js |
| State Management | React Context / Redux |
| HTTP Client | Axios / Fetch |
| Real-Time | WebSocket |
| Language | JavaScript / TypeScript |
| Styling | CSS / Tailwind / Material UI |

---

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/david-benjamin-02/smartchat-fe.git
cd smartchat-fe
````

For Backend:

```bash
git clone https://github.com/david-benjamin-02/smartchat-be.git
cd smartchat-be
```

---

### Install Dependencies

```bash
npm install
```

---

### Set Environment Variables

Create a `.env` file in the root directory:

```bash
REACT_APP_API_URL=http://127.0.0.1:8000
```

*(Replace with your deployed backend URL later)*

---

### Start the Frontend

```bash
npm start
```

Frontend runs on:
[http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```bash
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── App.js
│   ├── index.js
│   └── ...
│
├── public/
│   ├── index.html
│   └── ...
├── package.json
└── README.md
```

---

## API Integration

Your frontend communicates with the FastAPI backend endpoints like:

* `POST /auth/register`
* `POST /auth/login`
* `GET /contacts/{uid}`
* `POST /utils/upload-voice`
* WebSocket: `ws://127.0.0.1:8000/ws/chat/{sender_id}`

---

## Notes for Deployment

* Update the `REACT_APP_API_URL` variable in `.env` to point to your deployed backend API URL before production build.

---

## Demo Video 

[Watch Demo on Google Drive](https://drive.google.com/file/d/1jkZcyNrYn6G1ucOBB8xNm0dSTaIXmUK4/view?usp=sharing)

---

## Author

**David**
MSc Artificial Intelligence | AI Developer
[LinkedIn](https://www.linkedin.com/in/david-benjamin-74a1a6280)

---

## License

This project is licensed under the **MIT License**.

```