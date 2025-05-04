interface SpeechRecognition extends EventTarget {
    start(): void;
    stop(): void;
    lang: string;
    interimResults: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
  }
  
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  
  declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
  
  declare var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
  