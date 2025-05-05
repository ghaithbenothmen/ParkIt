import time
import threading
import numpy as np
import whisper
import sounddevice as sd
from queue import Queue
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rich.console import Console
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate
from langchain_community.llms import Ollama
import io
import soundfile as sf

console = Console()
stt = whisper.load_model("base.en")

template = """
You are a helpful and friendly AI assistant. You are polite, respectful, and aim to provide concise responses of less 
than 20 words.

The conversation transcript is as follows:
{history}

And here is the user's follow-up: {input}

Your response:
"""
PROMPT = PromptTemplate(input_variables=["history", "input"], template=template)
chain = ConversationChain(
    prompt=PROMPT,
    verbose=False,
    memory=ConversationBufferMemory(ai_prefix="Assistant:"),
    llm=Ollama(),
)

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def transcribe(audio_np: np.ndarray) -> str:
    result = stt.transcribe(audio_np, fp16=False)
    return result["text"].strip()

def get_llm_response(text: str) -> str:
    response = chain.predict(input=text)
    if response.startswith("Assistant:"):
        response = response[len("Assistant:"):].strip()
    return response

class TextResponse(BaseModel):
    response: str

@app.post("/voice", response_model=TextResponse)
async def handle_voice(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    # Decode WAV to numpy
    with io.BytesIO(audio_bytes) as audio_buffer:
        audio_np, _ = sf.read(audio_buffer)
        if audio_np.dtype != np.float32:
            audio_np = audio_np.astype(np.float32)

    if audio_np.size == 0:
        return {"response": "No audio received."}

    text = transcribe(audio_np)
    print(f"Transcribed text: {text}")

    response = get_llm_response(text)
    print(f"Assistant response: {response}")  # ← Added this line

    return {"response": response}
