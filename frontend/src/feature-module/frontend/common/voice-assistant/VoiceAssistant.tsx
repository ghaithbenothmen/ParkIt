import React, { useState } from "react";

function VoiceAssistant() {
  const [response, setResponse] = useState("");

  const handleVoiceCommand = async () => {
    const res = await fetch("http://localhost:5000/api/voice_command", {
      method: "POST",
    });

    const data = await res.json();
    setResponse(data.response);

    // Play the audio response (assuming the audio is returned as an array)
    const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
    audio.play();
  };

  return (
    <div>
      <button onClick={handleVoiceCommand}>Start Voice Command</button>
      <p>{response}</p>
    </div>
  );
}

export default VoiceAssistant;
