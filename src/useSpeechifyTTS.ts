/**
 * useSpeechifyTTS Hook
 * 
 * Foundational hook for integrating Speechify Text-to-Speech into Remotion animations.
 * Handles all the complexity of API calls, audio processing, and Remotion compatibility.
 * 
 * @example
 * ```tsx
 * const { narrationAudioPath, isGenerating, generateSpeech } = useSpeechifyTTS({
 *   text: 'Your text here',
 *   voiceId: 'oliver',
 *   language: 'en-US',
 *   autoGenerate: true, // Generate automatically on mount
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
 * @param config.voiceId - Voice ID (default: 'oliver')
 * @param config.language - Language code (default: 'en-US')
 * @param config.autoGenerate - Auto-generate on mount (default: true)
 * 
 * @returns Object with narrationAudioPath, isGenerating, speechDuration, generateSpeech function, and error state
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechifyService } from './speechify';
import { SPEECHIFY_CONFIG } from '../config/speechify.config';

export interface UseSpeechifyTTSConfig {
  text: string;
  voiceId?: string;
  language?: string;
  autoGenerate?: boolean;
}

export interface UseSpeechifyTTSReturn {
  narrationAudioPath: string | null;
  isGenerating: boolean;
  speechDuration: number;
  generateSpeech: () => Promise<void>;
  error: string | null;
}

export const useSpeechifyTTS = ({
  text,
  voiceId = 'oliver',
  language = 'en-US',
  autoGenerate = true,
}: UseSpeechifyTTSConfig): UseSpeechifyTTSReturn => {
  const [narrationAudioPath, setNarrationAudioPath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [speechDuration, setSpeechDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const speechifyServiceRef = useRef<SpeechifyService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Generates speech audio from text using Speechify API
   * 
   * Implementation Details:
   * 1. Calls Speechify TTS API with text, voice ID, and language
   * 2. Receives audio as Blob (MP3 format)
   * 3. Decodes audio to calculate duration for text synchronization
   * 4. Converts Blob to data URL using FileReader (more reliable than blob URLs with Remotion)
   * 5. Sets narrationAudioPath state, which can be used with Remotion Audio component
   */
  const generateSpeech = useCallback(async () => {
    if (!speechifyServiceRef.current || isGenerating || !text) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      // Call Speechify API to generate speech
      const audioBlob = await speechifyServiceRef.current.textToSpeech(
        text,
        voiceId,
        language
      );
      
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
      console.error('Failed to generate speech:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [text, voiceId, language, isGenerating]);

  // Initialize Speechify service
  useEffect(() => {
    if (SPEECHIFY_CONFIG.apiKey) {
      speechifyServiceRef.current = new SpeechifyService({
        apiKey: SPEECHIFY_CONFIG.apiKey,
      });
    } else {
      setError('Speechify API key not configured');
      console.warn('Speechify API key not configured. Speech generation disabled.');
    }

    // Initialize audio context for duration detection
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-generate speech on mount if enabled
  useEffect(() => {
    if (autoGenerate && speechifyServiceRef.current && text && !narrationAudioPath && !isGenerating) {
      generateSpeech();
    }
  }, [autoGenerate, text, narrationAudioPath, isGenerating, generateSpeech]);

  return {
    narrationAudioPath,
    isGenerating,
    speechDuration,
    generateSpeech,
    error,
  };
};
