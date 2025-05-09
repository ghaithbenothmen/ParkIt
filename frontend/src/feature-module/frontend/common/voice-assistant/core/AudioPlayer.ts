// src/core/AudioPlayer.ts

import { Howl } from 'howler';
import config from './config';
import Logger from './Logger';

interface SoundCallback {
  (): void;
}

class AudioPlayer {
  private readonly startSound: Howl;
  private readonly endSound: Howl;
  private currentSound: Howl | null = null;

  constructor() {
    this.startSound = this.initializeSound(config.startSoundFileUrl, 0.5);
    this.endSound = this.initializeSound(config.endSoundFileUrl, 0.5);
  }

  playAiReplyFromStream = (
    audioStream: ReadableStream<Uint8Array>,
    callback?: SoundCallback
  ): void => {
    Logger.log('F: playAiReplyFromStream');

    const audioContext = new AudioContext();
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    reader
      .read()
      .then(function process(
        result: ReadableStreamReadResult<Uint8Array>
      ): Promise<void> {
        const { done, value } = result;
        if (done) {
          const length = chunks.reduce((acc, val) => acc + val.length, 0);
          const concatenated = new Uint8Array(length);
          let offset = 0;
          for (const chunk of chunks) {
            concatenated.set(chunk, offset);
            offset += chunk.length;
          }

          return audioContext
            .decodeAudioData(concatenated.buffer)
            .then((buffer) => {
              const source = audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContext.destination);
              source.start();
              if (callback) callback();
            })
            .catch((error: any) => {
              Logger.error('Failed to play sound from stream', error);
            });
        }

        chunks.push(value!);
        return reader.read().then(process);
      })
      .catch((error: any) => {
        Logger.error('Failed to play sound from stream', error);
      });
  };

  playAiReplyFromUrl = (
    audioFileUrl: string,
    callback?: SoundCallback
  ): void => {
    Logger.log('F: playAiReplyFromUrl');
    this.currentSound = this.playSound(audioFileUrl, callback, 1.0);
  };

  playStartTone = (): void => {
    this.startSound.play();
  };

  playEndTone = (): void => {
    this.endSound.play();
  };

  setVolume = (volume: number): void => {
    if (this.currentSound) {
      this.currentSound.volume(volume);
    }
  };

  stopCurrentSound = (): void => {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound = null;
    }
  };

  private initializeSound = (
    soundFileUrl: string,
    volume = 1.0
  ): Howl => {
    return new Howl({
      src: [soundFileUrl],
      volume,
      onloaderror: (_id: number, error: any) =>
        Logger.error(`Failed to load sound: ${soundFileUrl}`, error),
      onplayerror: (_id: number, error: any) =>
        Logger.error(`Failed to play sound: ${soundFileUrl}`, error),
    });
  };

  private playSound = (
    soundFileUrl: string,
    callback?: SoundCallback,
    volume?: number
  ): Howl => {
    Logger.log('F: playSound');
    const sound = new Howl({
      src: [soundFileUrl],
      volume,
      onend: () => {
        if (callback) callback();
      },
      onloaderror: (_id: number, error: any) =>
        Logger.error(`Failed to load sound: ${soundFileUrl}`, error),
      onplayerror: (_id: number, error: any) =>
        Logger.error(`Failed to play sound: ${soundFileUrl}`, error),
    });

    sound.play();
    return sound;
  };
}

export default AudioPlayer;
