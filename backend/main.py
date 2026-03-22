from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="SignTalk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "SignTalk Engine Running"}

@app.websocket("/ws/sign-to-text")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive MediaPipe normalized coordinates from frontend
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Mocking the ST-GCN -> T5 pipeline response
            response_text = f"Received {len(payload)} frames. (Mock Translation)"
            
            # Send interpreted text back to the client
            await websocket.send_json({"text": response_text})
    except WebSocketDisconnect:
        print("Client disconnected from Sign-to-Text WebSocket.")

# Future: include routers for Text-to-Sign and One-Shot DB
