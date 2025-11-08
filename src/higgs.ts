/**
 * Higgs Audio API Integration Service
 * 
 * Provides Text-to-Speech (TTS) capabilities using the local higgs-audio model.
 * 
 * @see https://github.com/boson-ai/higgs-audio for model documentation
 * 
 * Implementation Details:
 * - Assumes a local HTTP API server is running (vLLM or custom wrapper)
 * - Default base URL: http://localhost:8000 (configurable)
 * - OpenAI-compatible API format (if using vLLM) or custom format
 * - Returns WAV audio format
 * 
 * Setup Required:
 * 1. Install higgs-audio Python library
 * 2. Start a local HTTP API server (see examples/vllm in higgs-audio repo)
 * 3. Configure baseUrl in higgs.config.ts
 */

export interface HiggsAudioConfig {
  baseUrl?: string;
  modelPath?: string;
  audioTokenizerPath?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxNewTokens?: number;
}

export interface HiggsAudioRequest {
  text: string;
  refAudio?: string; // Path to reference audio file for voice cloning
  temperature?: number;
  topP?: number;
  topK?: number;
  maxNewTokens?: number;
}

/**
 * HiggsAudioService - Service class for higgs-audio local model integration
 * 
 * Handles API communication with a local higgs-audio HTTP server.
 * Supports both OpenAI-compatible API (vLLM) and custom API formats.
 */
export class HiggsAudioService {
  private baseUrl: string;
  private config: HiggsAudioConfig;

  constructor(config: HiggsAudioConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8000';
    this.config = {
      modelPath: config.modelPath || 'bosonai/higgs-audio-v2-generation-3B-base',
      audioTokenizerPath: config.audioTokenizerPath || 'bosonai/higgs-audio-v2-tokenizer',
      temperature: config.temperature ?? 0.3,
      topP: config.topP ?? 0.95,
      topK: config.topK ?? 50,
      maxNewTokens: config.maxNewTokens ?? 1024,
      ...config,
    };
  }

  /**
   * Generate speech audio from text using higgs-audio local model
   * 
   * @param text - Text to convert to speech
   * @param options - Optional parameters (refAudio, temperature, etc.)
   * @returns Promise<Blob> - Audio blob (WAV format)
   */
  async textToSpeech(
    text: string,
    options: {
      refAudio?: string;
      temperature?: number;
      topP?: number;
      topK?: number;
      maxNewTokens?: number;
    } = {}
  ): Promise<Blob> {
    try {
      const url = `${this.baseUrl}/v1/audio/generate`;
      
      console.log('Calling Higgs Audio API:', {
        url,
        textLength: text.length,
        hasRefAudio: !!options.refAudio,
        temperature: options.temperature ?? this.config.temperature,
      });

      const requestBody = {
        text,
        ref_audio: options.refAudio,
        temperature: options.temperature ?? this.config.temperature,
        top_p: options.topP ?? this.config.topP,
        top_k: options.topK ?? this.config.topK,
        max_new_tokens: options.maxNewTokens ?? this.config.maxNewTokens,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/wav',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Higgs Audio API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Higgs Audio API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
        });
        throw new Error(`Higgs Audio API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      console.log('Response content type:', contentType);

      // Return audio blob
      return await response.blob();
    } catch (error) {
      console.error('Higgs Audio TTS error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }

  /**
   * Check if the higgs-audio API server is available
   * 
   * @returns Promise<boolean> - True if server is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
