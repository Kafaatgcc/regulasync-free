// Web Speech APIs are optional, particularly in Android in-app WebViews.
export function trySpeechOperation(operation: () => void): boolean {
  try {
    operation();
    return true;
  } catch {
    return false;
  }
}

interface SpeakOptions {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  onStart: () => void;
  onEnd: () => void;
  onError: () => void;
}

export interface SpeechOutput {
  getVoices(): SpeechSynthesisVoice[];
  subscribeVoices(listener: () => void): () => void;
  speak(text: string, options: SpeakOptions): boolean;
  cancel(): boolean;
}

export function createSpeechOutput(): SpeechOutput | null {
  try {
    if (typeof window === 'undefined') return null;
    const synthesis = window.speechSynthesis;
    const Utterance = window.SpeechSynthesisUtterance;
    if (!synthesis || typeof Utterance !== 'function' ||
        typeof synthesis.getVoices !== 'function' ||
        typeof synthesis.speak !== 'function' || typeof synthesis.cancel !== 'function') {
      return null;
    }
    // Some WebViews expose a constructor that throws instead of a usable API.
    new Utterance('');
    let activeUtterance: SpeechSynthesisUtterance | null = null;
    const cancel = () => {
      const utterance = activeUtterance;
      activeUtterance = null;
      if (utterance) {
        trySpeechOperation(() => {
          utterance.onstart = null;
          utterance.onend = null;
          utterance.onerror = null;
        });
      }
      return trySpeechOperation(() => synthesis.cancel());
    };

    return {
      getVoices() {
        try {
          const voices = synthesis.getVoices();
          return Array.isArray(voices) ? voices : [];
        } catch {
          return [];
        }
      },
      subscribeVoices(listener) {
        try {
          if (typeof synthesis.addEventListener === 'function' &&
              typeof synthesis.removeEventListener === 'function') {
            synthesis.addEventListener('voiceschanged', listener);
            return () => { trySpeechOperation(() => synthesis.removeEventListener('voiceschanged', listener)); };
          }
          const previous = synthesis.onvoiceschanged;
          const handler = (event: Event) => {
            trySpeechOperation(() => previous?.call(synthesis, event));
            listener();
          };
          synthesis.onvoiceschanged = handler;
          return () => {
            trySpeechOperation(() => {
              if (synthesis.onvoiceschanged === handler) synthesis.onvoiceschanged = previous;
            });
          };
        } catch {
          return () => {};
        }
      },
      speak(text, options) {
        return trySpeechOperation(() => {
          const utterance = new Utterance(text);
          if (!cancel()) throw new Error('Speech cancellation unavailable');
          utterance.voice = options.voice;
          utterance.rate = options.rate;
          utterance.pitch = options.pitch;
          utterance.onstart = () => { if (activeUtterance === utterance) options.onStart(); };
          utterance.onend = () => {
            if (activeUtterance !== utterance) return;
            activeUtterance = null;
            options.onEnd();
          };
          utterance.onerror = () => {
            if (activeUtterance !== utterance) return;
            activeUtterance = null;
            options.onError();
          };
          activeUtterance = utterance;
          synthesis.speak(utterance);
        });
      },
      cancel,
    };
  } catch {
    return null;
  }
}

export interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      0: { transcript: string; confidence: number };
      isFinal: boolean;
      length: number;
    };
  };
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
};

export function createSpeechRecognition(): SpeechRecognition | null {
  let recognition: SpeechRecognition | null = null;
  try {
    if (typeof window === 'undefined') return null;
    const speechWindow = window as SpeechWindow;
    const Recognition = typeof speechWindow.SpeechRecognition === 'function'
      ? speechWindow.SpeechRecognition : speechWindow.webkitSpeechRecognition;
    if (typeof Recognition !== 'function') return null;
    recognition = new Recognition();
    if (typeof recognition.start !== 'function' || typeof recognition.stop !== 'function' ||
        typeof recognition.abort !== 'function') {
      disposeSpeechRecognition(recognition);
      return null;
    }
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';
    return recognition;
  } catch {
    disposeSpeechRecognition(recognition);
    return null;
  }
}

export function disposeSpeechRecognition(recognition: SpeechRecognition | null): void {
  if (!recognition) return;
  // Detach callbacks before abort, which can synchronously fire onend.
  trySpeechOperation(() => { recognition.onresult = null; });
  trySpeechOperation(() => { recognition.onerror = null; });
  trySpeechOperation(() => { recognition.onend = null; });
  trySpeechOperation(() => recognition.abort());
}
