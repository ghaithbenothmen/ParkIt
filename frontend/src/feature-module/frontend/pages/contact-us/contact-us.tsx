// VoiceAssistantPage.tsx

"use client";
import * as React from "react";
import { Link } from "react-router-dom";

export default function ContactUs() {
  return (
    <div className="container py-5">
      {/* Trigger Button */}
      <Link
        className="btn btn-outline-primary"
        to="#"
        data-bs-toggle="modal"
        data-bs-target="#voice-assistant-modal"
      >
        <i className="ti ti-microphone me-2" />
        Talk to Assistant
      </Link>

      {/* Other homepage content */}
      <div className="mt-5">
        <h1>Welcome to Our Website</h1>
        <p>Click the button to speak with our voice assistant.</p>
      </div>

      {/* Voice Assistant Modal */}
    </div>
  );
}
