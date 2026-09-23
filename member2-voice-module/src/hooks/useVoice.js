/**
 * useVoice.js — Web Speech API Wrapper
 * (Member 2 / Voice Interaction Module)
 *
 * Wraps SpeechRecognition (STT) and SpeechSynthesis (TTS).
 * Safely feature-detects; if unsupported, isSupported = false and the
 * rest of the app can fallback gracefully without crashing.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoice() {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Feature detect Web Speech APIs
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    if (!SpeechRecognition || !synth) {
      console.warn('[useVoice] Web Speech API not supported in this browser. Falling back to touch UI.');
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current.toLowerCase().trim());
    };

    recognition.onerror = (event) => {
      // Aborted typically means the user stopped it manually or mic is busy
      if (event.error !== 'aborted') {
        console.warn('[useVoice] Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    try {
      setTranscript('');
      recognitionRef.current.start();
    } catch (e) {
      // Ignore "already started" errors
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    recognitionRef.current.stop();
  }, [isSupported]);

  const speak = useCallback((text) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel(); // Stop anything currently speaking
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  return { 
    isSupported, 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    speak 
  };
}
