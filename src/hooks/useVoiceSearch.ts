import { useState, useEffect, useCallback, useRef } from "react";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

// Extend Window interface
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

interface UseVoiceSearchOptions {
    lang?: string;
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
}

interface UseVoiceSearchReturn {
    isSupported: boolean;
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
}

/**
 * Custom hook for voice search using Web Speech API.
 * Handles browser compatibility and provides a clean interface.
 */
export function useVoiceSearch(
    options: UseVoiceSearchOptions = {}
): UseVoiceSearchReturn {
    const { lang = "vi-VN", onResult, onError } = options;

    const [isSupported, setIsSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Check browser support on mount
    useEffect(() => {
        const SpeechRecognitionAPI =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognitionAPI);

        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = lang;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const result = event.results[0];
                if (result && result.isFinal) {
                    const text = result[0].transcript;
                    setTranscript(text);
                    onResult?.(text);
                }
            };

            recognition.onerror = (event: Event) => {
                setIsListening(false);
                const errorMessage =
                    (event as unknown as { error?: string }).error ||
                    "Lỗi nhận dạng giọng nói";
                onError?.(errorMessage);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [lang, onResult, onError]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript("");
            try {
                recognitionRef.current.start();
            } catch (error) {
                // Recognition may already be started
                console.warn("Speech recognition error:", error);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return {
        isSupported,
        isListening,
        transcript,
        startListening,
        stopListening,
    };
}
