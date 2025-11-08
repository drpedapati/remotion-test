/**
 * useHiggsAudio Hook
 * 
 * Foundational hook for integrating higgs-audio local TTS model into Remotion animations.
 * Parallel component to useSpeechifyTTS, using open-source local model instead of cloud API.
 * 
 * @example
 * ```tsx
 * const { narrationAudioPath, isGenerating, generateSpeech } = useHiggsAudio({
 *   text: 'Your text here',
 *   refAudio: '/path/to/reference.wav', // Optional: for voice cloning
 *   autoGenerate: true,
 * });
 * 
 * // Then use in your component:
 * {narrationAudioPath && (
 *   <Audio src={narrationAudioPath} volume={1.0} startFrom={0} />
 * )}
 * ```
 * 
 * @param config - Configuration object
 * @param config.text - Text to convert to speech
 * @param config.refAudio - Optional: Path to reference audio for voice cloning
 * @param config.temperature - Optional: Generation temperature (default: 0.3)
 * @param config.autoGenerate - Auto-generate on mount (default: true)
 * 
 * @returns Object with narrationAudioPath, isGenerating, speechDuration, generateSpeech function, and error state
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { HiggsAudioService } from './higgs';
import { HIGGS_CONFIG } from '../config/higgs.config';

export interface UseHiggsAudioConfig {
  text: string;
  refAudio?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxNewTokens?: number;
  autoGenerate?: boolean;
}

export interface UseHiggsAudioReturn {
  narrationAudioPath: string | null;
  isGenerating: boolean;
  speechDuration: number;
  generateSpeech: () => Promise<void>;
  error: string | null;
  isServerAvailable: boolean;
}

export const useHiggsAudio = ({
  text,
  refAudio,
  temperature,
  topP,
  topK,
  maxNewTokens,
  autoGenerate = true,
}: UseHiggsAudioConfig): UseHiggsAudioReturn => {
  const [narrationAudioPath, setNarrationAudioPath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [speechDuration, setSpeechDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isServerAvailable, setIsServerAvailable] = useState<boolean>(false);
  const higgsServiceRef = useRef<HiggsAudioService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Generates speech audio from text using higgs-audio local model
   * 
   * Implementation Details:
   * 1. Calls local higgs-audio HTTP API server
   * 2. Receives audio as Blob (WAV format)
   * 3. Decodes audio to calculate duration for text synchronization
   * 4. Converts Blob to data URL using FileReader (more reliable than blob URLs with Remotion)
   * 5. Sets narrationAudioPath state, which can be used with Remotion Audio component
   */
  const generateSpeech = useCallback(async () => {
    if (!higgsServiceRef.current || isGenerating || !text) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      // Check server availability first
      const isAvailable = await higgsServiceRef.current.checkHealth();
      if (!isAvailable) {
        throw new Error('Higgs Audio server is not available. Please ensure the local server is running.');
      }
      setIsServerAvailable(true);

      // Call higgs-audio API to generate speech
      const audioBlob = await higgsServiceRef.current.textToSpeech(text, {
        refAudio,
        temperature,
        topP,
        topK,
        maxNewTokens,
      });
      
      // Decode audio to calculate duration for text synchronization
      const arrayBuffer = await audioBlob.arrayBuffer();
      if (audioContextRef.current) {
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setSpeechDuration(audioBuffer.duration);
      }
      
      // Convert Blob to data URL for Remotion Audio component compatibility
      // Data URLs work more reliably than blob URLs with Remotion's mediabunny library
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setNarrationAudioPath(dataUrl);
      };
      reader.readAsDataURL(audioBlob);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsServerAvailable(false);
      console.error('Failed to generate speech with higgs-audio:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [text, refAudio, temperature, topP, topK, maxNewTokens, isGenerating]);

  // Initialize higgs-audio service
  useEffect(() => {
    higgsServiceRef.current = new HiggsAudioService({
      baseUrl: HIGGS_CONFIG.baseUrl,
      temperature: HIGGS_CONFIG.temperature,
      topP: HIGGS_CONFIG.topP,
      topK: HIGGS_CONFIG.topK,
      maxNewTokens: HIGGS_CONFIG.maxNewTokens,
    });

    // Initialize audio context for duration detection
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Check server availability
    higgsServiceRef.current.checkHealth().then(setIsServerAvailable);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-generate speech on mount if enabled
  useEffect(() => {
    if (autoGenerate && higgsServiceRef.current && text && !narrationAudioPath && !isGenerating && isServerAvailable) {
      generateSpeech();
    }
  }, [autoGenerate, text, narrationAudioPath, isGenerating, isServerAvailable, generateSpeech]);

  return {
    narrationAudioPath,
    isGenerating,
    speechDuration,
    generateSpeech,
    error,
    isServerAvailable,
  };
};
