import { useState, useEffect, useCallback, useRef } from 'react';

export interface AudioState {
    isPlaying: boolean;
    isPaused: boolean;
    voice: SpeechSynthesisVoice | null;
    rate: number;
    supported: boolean;
}

export function useAudioBible() {
    const [state, setState] = useState<AudioState>({
        isPlaying: false,
        isPaused: false,
        voice: null,
        rate: 1.0,
        supported: 'speechSynthesis' in window,
    });

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    // Initialize Speech Synthesis
    useEffect(() => {
        if (!state.supported) return;

        synth.current = window.speechSynthesis;

        const loadVoices = () => {
            const availableVoices = synth.current?.getVoices() || [];
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                // Default to first English voice if available, or just the first one
                const defaultVoice = availableVoices.find(v => v.lang.startsWith('en-US')) || availableVoices[0];
                setState(prev => ({ ...prev, voice: defaultVoice }));
            }
        };

        loadVoices();

        // Chrome loads voices asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [state.supported]);

    const play = useCallback((text: string) => {
        if (!synth.current || !text) return;

        // Cancel any current speaking
        synth.current.cancel();

        const newUtterance = new SpeechSynthesisUtterance(text);

        if (state.voice) {
            newUtterance.voice = state.voice;
        }
        newUtterance.rate = state.rate;

        newUtterance.onstart = () => {
            setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
        };

        newUtterance.onend = () => {
            setState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
        };

        newUtterance.onerror = (event) => {
            console.error("Speech synthesis error", event);
            setState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
        };

        // Keeping reference to prevent garbage collection bugs in some browsers
        utterance.current = newUtterance;
        synth.current.speak(newUtterance);

    }, [state.voice, state.rate]);

    const pause = useCallback(() => {
        if (synth.current?.speaking && !synth.current.paused) {
            synth.current.pause();
            setState(prev => ({ ...prev, isPaused: true }));
        }
    }, []);

    const resume = useCallback(() => {
        if (synth.current?.paused) {
            synth.current.resume();
            setState(prev => ({ ...prev, isPaused: false }));
        }
    }, []);

    const stop = useCallback(() => {
        if (synth.current?.speaking || synth.current?.paused) {
            synth.current.cancel();
            setState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
        }
    }, []);

    const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
        setState(prev => ({ ...prev, voice }));
        // If playing, we might want to restart? For now, just update state for next play.
        // Or if we want dynamic switching, we'd need to stop and replay with current progress (hard to track exact progress).
    }, []);

    const setRate = useCallback((rate: number) => {
        setState(prev => ({ ...prev, rate }));
        // Dynamic rate change usually requires restarting utterance in Web Speech API
    }, []);

    return {
        ...state,
        voices,
        play,
        pause,
        resume,
        stop,
        setVoice,
        setRate
    };
}
