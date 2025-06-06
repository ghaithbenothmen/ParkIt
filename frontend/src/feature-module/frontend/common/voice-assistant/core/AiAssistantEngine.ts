import EventEmitter from './EventEmitter';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';
import Logger from './Logger';
import ErrorReporter from './ErrorReporter';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

/**
 * Expected Dialogflow response shape.
 */
interface DialogflowResponse {
  queryResult: {
    fulfillmentText?: string;
    redirect?: string;
  };
}

class AiAssistantEngine extends EventEmitter {
  private readonly audioPlayer: AudioPlayer;
  private readonly audioRecorder: AudioRecorder;
  private readonly userId: string | null;
  private gettingUserInput = false;
  private makingAPIRequest = false;

  constructor(debugMode = false) {
    super();
    Logger.setDebugMode(debugMode);

    this.audioRecorder = new AudioRecorder();
    this.audioPlayer = new AudioPlayer();

    const token = localStorage.getItem('token');
    let id: string | null = null;

    if (token) {
      try {
        const decoded = jwtDecode<{ id: string }>(token);
        id = decoded.id;
        Logger.log(`Decoded user ID: ${id}`);
      } catch (error) {
        Logger.error('Invalid token:', error);
      }
    }

    this.userId = id;
    Logger.log('Initialize Ai Assistant Engine');
  }

  startProcessing = async (): Promise<void> => {
    Logger.log('F: startProcessing');

    try {
      this.audioPlayer.setVolume(0.15);
      this._resetEngine();

      this.emitStateChange(EventEmitter.STATE_LISTENING_START);
      this.audioPlayer.playStartTone();

      const transcript = await this._getUserAudioInput();
      Logger.log(`Transcript = "${transcript}"`);

      await this._makeDialogflowCall(transcript);
    } catch (error: any) {
      Logger.error('Processing error:', error);
      ErrorReporter.captureException(error);
      this.emitStateChange(EventEmitter.STATE_IDLE);
    }
  };

  private _makeDialogflowCall = async (text: string): Promise<void> => {
    Logger.log('F: _makeDialogflowCall');
    this.makingAPIRequest = true;
    this.emitStateChange(EventEmitter.STATE_THINKING_START);

    try {
      const res = await axios.post<DialogflowResponse>(
        `${process.env.REACT_APP_API_BASE_URL}/voice/dialogflow`,
        { query: text, session: 'user-session-id' }
      );

      Logger.log('Dialogflow response:', res.data);
      console.log("yyyyyyyyyyyyyyyyyyyyyyyy", res.status)
      const { queryResult } = res.data;
      const reply = queryResult.fulfillmentText || '';
      const redirect = queryResult.redirect;
      this._handleApiResponse({
        statusCode: res.status,
        message: res.statusText,
        data: {
          outputTextReply: reply,
          redirectUrl: redirect,
        },
      });
    } catch (err: any) {
      Logger.error('Dialogflow call error:', err);
      ErrorReporter.captureException(err);
    } finally {
      this.makingAPIRequest = false;
      this.emitStateChange(EventEmitter.STATE_IDLE);
    }
  };

  private _handleApiResponse = (response: {
    statusCode: number;
    message: string;
    data: { outputTextReply?: string; redirectUrl?: string };
  }): void => {
    Logger.log('F: _handleApiResponse:', response);

    if (response.statusCode >= 400) {
      if (response.statusCode === 403 || response.statusCode === 429) {
        Logger.error(
          `Server Access Issue: ${response.statusCode} – ${response.message}`
        );
        this.emitStateChange(EventEmitter.STATE_FREEZING);
      } else {
        Logger.error(
          `Server Error: ${response.statusCode} – ${response.message}`
        );
        this.emitStateChange(EventEmitter.STATE_IDLE);
      }
      return;
    }

    if (response.data.outputTextReply) {
      this._handleTextResponse(response.data.outputTextReply);
    }

    if (response.data.redirectUrl) {
      const redirectUrl = response.data.redirectUrl;
      this.emit('toast', "reservation success");
setTimeout(() => {
    window.location.href = redirectUrl;
  }, 2300);
    }
  };

  private _handleTextResponse(content: string): void {
    Logger.log('F: _handleTextResponse');
    Logger.log('>>> AI OUTPUT:', content);

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      speechSynthesis.speak(utterance);
    }
  }

  private _resetEngine(): void {
    Logger.log('F: _resetEngine');
    this.emitStateChange(EventEmitter.STATE_IDLE);
    this.gettingUserInput = false;
    this.makingAPIRequest = false;
  }

  private _getUserAudioInput = async (): Promise<string> => {
    Logger.log('F: _getUserAudioInput');
    this.gettingUserInput = true;
    this.emitStateChange(EventEmitter.STATE_LISTENING_START);

    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionConstructor) {
      Logger.log('Using Web Speech API for transcription');
      return new Promise<string>((resolve) => {
        const recog: any = new SpeechRecognitionConstructor();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          const transcript = Array.from(
            event.results as SpeechRecognitionResultList
          )
            .map((r: any) => r[0].transcript)
            .join('');
          Logger.log(`WebSpeechAPI result: "${transcript}"`);
          cleanup();
          resolve(transcript);
        };

        recog.onerror = (error: any) => {
          Logger.error('WebSpeechAPI error:', error);
          cleanup();
          resolve('');
        };

        recog.onend = () => {
          Logger.log('WebSpeechAPI ended without result');
          cleanup();
          resolve('');
        };

        recog.start();

        const cleanup = () => {
          recog.onresult = null;
          recog.onerror = null;
          recog.onend = null;
          this.gettingUserInput = false;
        };
      });
    } else {
      Logger.log('Web Speech API not available – falling back to recorder');
      try {
        await this.audioRecorder.startRecording();
        Logger.log('Fallback recorder: recorded blob, STT TODO');
      } catch (err: any) {
        Logger.error('AudioRecorder error:', err);
        ErrorReporter.captureException(err);
      } finally {
        this.gettingUserInput = false;
      }
      return '';
    }
  };
}

export default AiAssistantEngine;
