from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

# Import placeholder services
from services.stt_service import transcribe_audio
from services.llm_service import generate_response
from services.tts_service import synthesize_speech

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the TalentFlow AI Interview API"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # 1. Eva asks the first question
        initial_question_text = "Hello, thank you for joining. To start, can you tell me a bit about yourself?"
        initial_audio = await synthesize_speech(initial_question_text)
        await websocket.send_json({"type": "audio", "payload": initial_audio})

        while True:
            # 2. Receive audio data from the client
            data = await websocket.receive_json()
            if data['type'] == 'audio_chunk':
                audio_chunk = data['payload']

                # 3. Transcribe the audio to text (STT)
                transcribed_text = await transcribe_audio(audio_chunk)
                await websocket.send_json({"type": "transcript", "payload": transcribed_text})

                # 4. Generate a response with the LLM
                llm_response_text = await generate_response(transcribed_text)

                # 5. Synthesize the LLM response to audio (TTS)
                response_audio = await synthesize_speech(llm_response_text)

                # 6. Send the new audio back to the client
                await websocket.send_json({"type": "audio", "payload": response_audio})

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"An error occurred: {e}")