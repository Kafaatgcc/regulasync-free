import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createSpeechOutput,
  createSpeechRecognition,
  disposeSpeechRecognition,
  trySpeechOperation,
  type SpeechRecognition,
} from '../client/src/lib/speech';

afterEach(() => {
  vi.unstubAllGlobals();
});

function synthesisBrowser() {
  const voices = [{ lang: 'en-GB', name: 'British English' }] as SpeechSynthesisVoice[];
  const synthesis = {
    getVoices: vi.fn(() => voices),
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onvoiceschanged: null as ((event: Event) => void) | null,
  };
  const Utterance = vi.fn(function (this: Record<string, unknown>, text: string) {
    this.text = text;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  });
  const browser = { speechSynthesis: synthesis, SpeechSynthesisUtterance: Utterance };
  vi.stubGlobal('window', browser);
  return { browser, synthesis, Utterance, voices };
}

function recognitionBrowser(prefixed = false) {
  const recognition = {
    continuous: true,
    interimResults: false,
    lang: '',
    onresult: vi.fn(),
    onerror: vi.fn(),
    onend: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
  };
  const Recognition = vi.fn(function () { return recognition; });
  vi.stubGlobal('window', {
    [prefixed ? 'webkitSpeechRecognition' : 'SpeechRecognition']: Recognition,
  });
  return { recognition, Recognition };
}

const speakOptions = () => ({
  voice: null,
  rate: 1.2,
  pitch: 0.8,
  onStart: vi.fn(),
  onEnd: vi.fn(),
  onError: vi.fn(),
});

const throws = () => { throw new Error('Unsupported WebView API'); };

describe('speech compatibility without browser APIs', () => {
  it('imports and runs without a window (Node/SSR)', () => {
    expect(typeof window).toBe('undefined');
    expect(createSpeechOutput()).toBeNull();
    expect(createSpeechRecognition()).toBeNull();
    expect(() => disposeSpeechRecognition(null)).not.toThrow();
  });

  it('handles a WebView with no voice APIs', () => {
    vi.stubGlobal('window', {});
    expect(createSpeechOutput()).toBeNull();
    expect(createSpeechRecognition()).toBeNull();
  });

  it('does not use synthesis or utterance globals outside window', () => {
    vi.stubGlobal('speechSynthesis', { getVoices: throws });
    vi.stubGlobal('SpeechSynthesisUtterance', throws);
    vi.stubGlobal('SpeechRecognition', throws);
    vi.stubGlobal('window', {});
    expect(createSpeechOutput()).toBeNull();
    expect(createSpeechRecognition()).toBeNull();
  });

  it('requires synthesis even when an utterance constructor exists', () => {
    const Utterance = vi.fn();
    vi.stubGlobal('window', { SpeechSynthesisUtterance: Utterance });
    expect(createSpeechOutput()).toBeNull();
    expect(Utterance).not.toHaveBeenCalled();
  });

  it.each([undefined, null, {}])('requires a usable utterance constructor (%#)', constructor => {
    const { browser, synthesis } = synthesisBrowser();
    Object.assign(browser, { SpeechSynthesisUtterance: constructor });
    expect(createSpeechOutput()).toBeNull();
    expect(synthesis.speak).not.toHaveBeenCalled();
  });

  it.each(['getVoices', 'speak', 'cancel'])('requires synthesis.%s to be callable', method => {
    const { synthesis } = synthesisBrowser();
    Object.assign(synthesis, { [method]: undefined });
    expect(createSpeechOutput()).toBeNull();
  });

  it('handles an utterance constructor that throws', () => {
    const { browser } = synthesisBrowser();
    browser.SpeechSynthesisUtterance = vi.fn(throws);
    expect(createSpeechOutput()).toBeNull();
  });

  it.each(['speechSynthesis', 'SpeechSynthesisUtterance', 'SpeechRecognition', 'webkitSpeechRecognition'])(
    'handles throwing window.%s getters', property => {
      vi.stubGlobal('window', Object.defineProperty({}, property, { get: throws }));
      expect(createSpeechOutput()).toBeNull();
      expect(createSpeechRecognition()).toBeNull();
    }
  );

  it.each([undefined, null, {}])('handles missing or invalid recognition constructors (%#)', constructor => {
    vi.stubGlobal('window', { SpeechRecognition: constructor, webkitSpeechRecognition: constructor });
    expect(createSpeechRecognition()).toBeNull();
  });

  it.each(['SpeechRecognition', 'webkitSpeechRecognition'])('handles a throwing %s constructor', property => {
    vi.stubGlobal('window', { [property]: vi.fn(throws) });
    expect(createSpeechRecognition()).toBeNull();
  });
});

describe('available speech synthesis', () => {
  it('loads voices and speaks with the chosen voice, rate, pitch and lifecycle callbacks', () => {
    const { synthesis, voices } = synthesisBrowser();
    const output = createSpeechOutput()!;
    expect(output.getVoices()).toBe(voices);
    const options = { ...speakOptions(), voice: voices[0] };
    expect(output.speak('Hello', options)).toBe(true);
    const utterance = synthesis.speak.mock.calls[0][0];
    expect(synthesis.cancel).toHaveBeenCalledTimes(1);
    expect(utterance).toMatchObject({ text: 'Hello', voice: voices[0], rate: 1.2, pitch: 0.8 });
    utterance.onstart();
    expect(options.onStart).toHaveBeenCalledOnce();
    utterance.onend();
    expect(options.onEnd).toHaveBeenCalledOnce();
    expect(output.speak('Again', options)).toBe(true);
    synthesis.speak.mock.calls[1][0].onerror();
    expect(options.onError).toHaveBeenCalledOnce();
  });

  it('subscribes to voice changes without overwriting other handlers and removes its listener', () => {
    const { synthesis } = synthesisBrowser();
    const previous = vi.fn();
    synthesis.onvoiceschanged = previous;
    const output = createSpeechOutput()!;
    const listener = vi.fn();
    const unsubscribe = output.subscribeVoices(listener);
    expect(synthesis.addEventListener).toHaveBeenCalledWith('voiceschanged', listener);
    expect(synthesis.onvoiceschanged).toBe(previous);
    synthesis.addEventListener.mock.calls[0][1]();
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    expect(synthesis.removeEventListener).toHaveBeenCalledWith('voiceschanged', listener);
  });

  it('preserves/restores the existing handler when only onvoiceschanged is supported', () => {
    const { synthesis } = synthesisBrowser();
    Object.assign(synthesis, { addEventListener: undefined, removeEventListener: undefined });
    const previous = vi.fn();
    synthesis.onvoiceschanged = previous;
    const listener = vi.fn();
    const unsubscribe = createSpeechOutput()!.subscribeVoices(listener);
    const event = new Event('voiceschanged');
    synthesis.onvoiceschanged!(event);
    expect(previous).toHaveBeenCalledWith(event);
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    expect(synthesis.onvoiceschanged).toBe(previous);
  });

  it('does not overwrite a newer voice-change handler during cleanup', () => {
    const { synthesis } = synthesisBrowser();
    Object.assign(synthesis, { addEventListener: undefined, removeEventListener: undefined });
    const unsubscribe = createSpeechOutput()!.subscribeVoices(vi.fn());
    const newer = vi.fn();
    synthesis.onvoiceschanged = newer;
    unsubscribe();
    expect(synthesis.onvoiceschanged).toBe(newer);
  });

  it('detaches speech callbacks on cancel, so late events cannot update an unmounted chat', () => {
    const { synthesis } = synthesisBrowser();
    const output = createSpeechOutput()!;
    const options = speakOptions();
    output.speak('Hello', options);
    const utterance = synthesis.speak.mock.calls[0][0];
    const lateStart = utterance.onstart;
    const lateEnd = utterance.onend;
    expect(output.cancel()).toBe(true);
    expect(utterance).toMatchObject({ onstart: null, onend: null, onerror: null });
    lateStart();
    lateEnd();
    expect(options.onStart).not.toHaveBeenCalled();
    expect(options.onEnd).not.toHaveBeenCalled();
  });
});

describe('throwing speech synthesis implementations', () => {
  it('returns an empty voice list when getVoices throws or returns an invalid value', () => {
    const { synthesis } = synthesisBrowser();
    const output = createSpeechOutput()!;
    synthesis.getVoices.mockImplementation(throws);
    expect(output.getVoices()).toEqual([]);
    synthesis.getVoices.mockReturnValue(undefined as never);
    expect(output.getVoices()).toEqual([]);
  });

  it.each(['speak', 'cancel'])('safely handles synthesis.%s throwing', method => {
    const { synthesis } = synthesisBrowser();
    const output = createSpeechOutput()!;
    synthesis[method as 'speak' | 'cancel'].mockImplementation(throws);
    expect(output.speak('Hello', speakOptions())).toBe(false);
    expect(() => output.cancel()).not.toThrow();
    if (method === 'cancel') expect(output.cancel()).toBe(false);
  });

  it('safely handles an utterance constructor that starts throwing after initialization', () => {
    const { Utterance } = synthesisBrowser();
    const output = createSpeechOutput()!;
    Utterance.mockImplementation(throws);
    expect(output.speak('Hello', speakOptions())).toBe(false);
  });

  it('handles voice subscription and unsubscribe methods throwing', () => {
    const { synthesis } = synthesisBrowser();
    const output = createSpeechOutput()!;
    synthesis.addEventListener.mockImplementation(throws);
    const firstCleanup = output.subscribeVoices(vi.fn());
    expect(() => firstCleanup()).not.toThrow();
    synthesis.addEventListener.mockImplementation(() => {});
    const cleanup = output.subscribeVoices(vi.fn());
    synthesis.removeEventListener.mockImplementation(throws);
    expect(() => cleanup()).not.toThrow();
  });

  it('handles an onvoiceschanged setter throwing', () => {
    const { synthesis } = synthesisBrowser();
    Object.assign(synthesis, { addEventListener: undefined, removeEventListener: undefined });
    Object.defineProperty(synthesis, 'onvoiceschanged', { set: throws });
    const cleanup = createSpeechOutput()!.subscribeVoices(vi.fn());
    expect(() => cleanup()).not.toThrow();
  });
});

describe('available and throwing speech recognition', () => {
  it.each([false, true])('initializes standard or prefixed recognition (%#)', prefixed => {
    const { recognition, Recognition } = recognitionBrowser(prefixed);
    const instance = createSpeechRecognition()!;
    expect(instance).toBe(recognition);
    expect(Recognition).toHaveBeenCalledOnce();
    expect(instance).toMatchObject({ continuous: false, interimResults: true, lang: 'en-GB' });
    expect(trySpeechOperation(() => instance.start())).toBe(true);
    expect(trySpeechOperation(() => instance.stop())).toBe(true);
    expect(recognition.start).toHaveBeenCalledOnce();
    expect(recognition.stop).toHaveBeenCalledOnce();
  });

  it('requires callable recognition methods', () => {
    const { recognition } = recognitionBrowser();
    Object.assign(recognition, { start: undefined });
    expect(createSpeechRecognition()).toBeNull();
    expect(recognition.abort).toHaveBeenCalledOnce();
  });

  it('cleans up a recognition instance if configuration throws', () => {
    const { recognition } = recognitionBrowser();
    Object.defineProperty(recognition, 'lang', { set: throws });
    expect(createSpeechRecognition()).toBeNull();
    expect(recognition.abort).toHaveBeenCalledOnce();
    expect(recognition.onresult).toBeNull();
  });

  it.each(['start', 'stop', 'abort'] as const)('safely handles recognition.%s throwing', method => {
    const { recognition } = recognitionBrowser();
    const instance = createSpeechRecognition()!;
    recognition[method].mockImplementation(throws);
    expect(trySpeechOperation(() => instance[method]())).toBe(false);
    expect(() => disposeSpeechRecognition(instance)).not.toThrow();
  });

  it('detaches all recognition callbacks before aborting', () => {
    const { recognition } = recognitionBrowser();
    recognition.abort.mockImplementation(() => {
      expect(recognition.onresult).toBeNull();
      expect(recognition.onerror).toBeNull();
      expect(recognition.onend).toBeNull();
    });
    disposeSpeechRecognition(recognition as unknown as SpeechRecognition);
    expect(recognition.abort).toHaveBeenCalledOnce();
  });

  it('still attempts abort even if clearing a callback throws', () => {
    const { recognition } = recognitionBrowser();
    Object.defineProperty(recognition, 'onresult', { set: throws });
    expect(() => disposeSpeechRecognition(recognition as unknown as SpeechRecognition)).not.toThrow();
    expect(recognition.onerror).toBeNull();
    expect(recognition.onend).toBeNull();
    expect(recognition.abort).toHaveBeenCalledOnce();
  });
});
