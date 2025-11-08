/**
 * Speechify API Integration Service
 * 
 * Provides Text-to-Speech (TTS) and Audio Transcription capabilities using the Speechify API.
 * 
 * @see https://docs.sws.speechify.com/ for API documentation
 * 
 * Implementation Details:
 * - Base URL: https://api.sws.speechify.com
 * - Authentication: Bearer token via Authorization header
 * - TTS Endpoint: /v1/audio/stream (POST)
 * - Transcription Endpoint: /transcribe (POST)
 * - Voices Endpoint: /v1/voices (GET)
 * 
 * Key Implementation Decisions:
 * 1. Uses data URLs instead of blob URLs for Remotion Audio component compatibility
 * 2. Request format: { input: string, voice_id: string, language: string }
 * 3. Accept header: 'audio/mpeg' for MP3 format
 * 4. Error handling includes detailed logging for debugging
 */

import { useState, useEffect, useRef } from 'react';

export interface SpeechifyConfig {
  apiKey: string;
  voiceId?: string;
  language?: string;
}

/**
 * SpeechifyService - Main service class for Speechify API integration
 * 
 * Handles all API communication with Speechify's TTS and transcription services.
 */
export class SpeechifyService {
  private apiKey: string;
  private baseUrl = 'https://api.sws.speechify.com';

  constructor(config: SpeechifyConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Transcribes audio to text using Speechify API
   * 
   * @param audioBlob - Audio blob to transcribe (typically WebM format from MediaRecorder)
   * @returns Promise resolving to the transcribed text
   * @throws Error if the API request fails
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    try {
      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Speechify API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Speechify API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.transcript || '';
    } catch (error) {
      console.error('Speechify transcription error:', error);
      throw error;
    }
  }

  /**
   * Fetches available voices from Speechify API
   * 
   * @returns Promise resolving to an array of available voice objects
   * @throws Error if the API request fails
   */
  async getVoices(): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/v1/voices`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch voices: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data.voices || []);
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Converts text to speech using Speechify API
   * 
   * Implementation Notes:
   * - Uses POST /v1/audio/stream endpoint
   * - Request body: { input: string, voice_id: string, language: string }
   * - Accept header: 'audio/mpeg' for MP3 format
   * - Returns audio as Blob for use with Remotion Audio component
   * 
   * @param text - The text to convert to speech
   * @param voiceId - Voice ID (e.g., 'oliver'). Defaults to 'default' if not provided
   * @param language - Language code in ISO 639-1 format (e.g., 'en-US'). Defaults to 'en-US'
   * @returns Promise resolving to a Blob containing the audio data (MP3 format)
   * @throws Error if the API request fails
   */
  async textToSpeech(text: string, voiceId?: string, language?: string): Promise<Blob> {
    try {
      const url = `${this.baseUrl}/v1/audio/stream`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg', // Request MP3 format
        },
        body: JSON.stringify({
          input: text, // API uses 'input' not 'text'
          voice_id: voiceId || 'default',
          language: language || 'en-US',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Speechify API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
        });
        throw new Error(`Speechify API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Speechify TTS error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }
}

// Example usage hook for Speechify integration
export const useSpeechifyDictation = (apiKey: string) => {
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechifyService = useRef<SpeechifyService | null>(null);

  useEffect(() => {
    if (apiKey) {
      speechifyService.current = new SpeechifyService({ apiKey });
    }
  }, [apiKey]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (speechifyService.current) {
          setIsProcessing(true);
          try {
            const transcription = await speechifyService.current.transcribeAudio(audioBlob);
            setTranscript((prev) => prev + ' ' + transcription);
          } catch (error) {
            console.error('Transcription failed:', error);
          } finally {
            setIsProcessing(false);
          }
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    transcript,
    isProcessing,
    startRecording,
    stopRecording,
  };
};
