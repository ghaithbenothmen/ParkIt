import React, { useRef, useState } from "react";

const VoiceAssistant: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStart = async () => {
    setResponse(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const webmBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const arrayBuffer = await webmBlob.arrayBuffer();

      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      const wavBlob = await encodeWAV(decoded);
      await sendAudio(wavBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const sendAudio = async (wavBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", wavBlob, "audio.wav");

    const res = await fetch("http://localhost:8000/voice", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const message = data.response || "No response";
    setResponse(message);

    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utterance);
  };

  const encodeWAV = async (buffer: AudioBuffer): Promise<Blob> => {
    const sampleRate = 16000;
    const offlineCtx = new OfflineAudioContext(1, buffer.duration * sampleRate, sampleRate);
    const monoBuffer = offlineCtx.createBuffer(1, buffer.length, buffer.sampleRate);
    const channelData = buffer.numberOfChannels > 1 ? averageChannels(buffer) : buffer.getChannelData(0);
    monoBuffer.copyToChannel(channelData, 0);

    const source = offlineCtx.createBufferSource();
    source.buffer = monoBuffer;
    source.connect(offlineCtx.destination);
    source.start();

    const rendered = await offlineCtx.startRendering();
    const raw = rendered.getChannelData(0);
    const length = raw.length;
    const wavBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(wavBuffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byteRate
    view.setUint16(32, 2, true); // blockAlign
    view.setUint16(34, 16, true); // bitsPerSample
    writeString(view, 36, "data");
    view.setUint32(40, length * 2, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, raw[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const averageChannels = (buffer: AudioBuffer): Float32Array => {
    const length = buffer.length;
    const result = new Float32Array(length);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        result[i] += data[i] / buffer.numberOfChannels;
      }
    }
    return result;
  };

  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center space-y-4">
      <h1 className="text-xl font-bold">🎙 Voice Assistant</h1>
      <button
        onClick={isRecording ? handleStop : handleStart}
        className={`px-4 py-2 rounded text-white ${isRecording ? "bg-red-500" : "bg-blue-500"}`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {response && <p className="mt-4 text-green-700 font-medium">Assistant: {response}</p>}
    </div>
  );
};

export default VoiceAssistant;
