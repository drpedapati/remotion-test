import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Audio,
} from 'remotion';
import { BackgroundMusic } from './BackgroundMusic';
import { MUSIC_CONFIG } from '../config/music.config';
import { useSpeechifyTTS } from './useSpeechifyTTS';

// Example script - replace with your own text
const SCRIPT = `This is a test of the foundational TTS component. 
The speech will generate automatically and play with synchronized text display. 
You can easily integrate this into any Remotion animation by importing the useSpeechifyTTS hook.`;

export const TTSTestAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Use the foundational TTS hook
  const {
    narrationAudioPath,
    isGenerating,
    speechDuration,
    generateSpeech,
    error,
  } = useSpeechifyTTS({
    text: SCRIPT,
    voiceId: 'oliver',
    language: 'en-US',
    autoGenerate: true, // Auto-generate on mount
  });

  // Calculate which part of the script to show based on frame and speech timing
  const scriptWords = SCRIPT.split(' ');
  const wordsPerSecond = speechDuration > 0 
    ? scriptWords.length / speechDuration 
    : 2.5;
  const currentWordIndex = Math.floor((frame / fps) * wordsPerSecond);
  const displayedText = scriptWords.slice(0, Math.min(currentWordIndex + 1, scriptWords.length)).join(' ');

  // Fade in animation
  const opacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Background gradient animation
  const bgHue = interpolate(
    frame,
    [0, durationInFrames],
    [200, 280],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, hsl(${bgHue}, 50%, 20%) 0%, hsl(${bgHue + 60}, 60%, 15%) 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 60,
        opacity,
      }}
    >
      {/* Background Music */}
      <BackgroundMusic
        src={MUSIC_CONFIG.backgroundMusicSrc}
        volume={MUSIC_CONFIG.volume * 0.5}
        startFrom={0}
        endAt={undefined}
      />

      {/* Narration Audio from Speechify */}
      {narrationAudioPath && (
        <Audio
          src={narrationAudioPath}
          volume={1.0}
          startFrom={0}
          loop={false}
        />
      )}

      {/* Manual Generate Button (if auto-generate fails) */}
      {!narrationAudioPath && !isGenerating && !error && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            zIndex: 10,
          }}
        >
          <button
            onClick={generateSpeech}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            🎤 Generate Speech
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isGenerating && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            padding: '12px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 8,
            fontSize: 16,
            color: '#4CAF50',
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          🔄 Generating speech...
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            padding: '12px 24px',
            backgroundColor: 'rgba(244, 67, 54, 0.9)',
            borderRadius: 8,
            fontSize: 14,
            color: 'white',
            fontWeight: 'bold',
            zIndex: 10,
            maxWidth: 400,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          marginBottom: 50,
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        TTS Foundation Component Test
      </div>

      {/* Script Text */}
      <div
        style={{
          width: width * 0.75,
          maxWidth: 1200,
          padding: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            color: '#2d3748',
            fontSize: 32,
            lineHeight: 1.8,
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {displayedText || (isGenerating ? 'Generating speech...' : 'Ready to generate')}
          <span
            style={{
              display: 'inline-block',
              width: 3,
              height: 32,
              backgroundColor: '#4CAF50',
              marginLeft: 6,
              animation: 'blink 1s infinite',
            }}
          />
        </div>
      </div>

      {/* Info Box */}
      <div
        style={{
          marginTop: 40,
          padding: 30,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 16,
          maxWidth: 800,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontSize: 18,
            lineHeight: 1.6,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20 }}>
            ✓ Foundational Component Working
          </div>
          <div style={{ opacity: 0.9 }}>
            Speech Duration: {speechDuration > 0 ? `${speechDuration.toFixed(2)}s` : 'Calculating...'}
          </div>
          <div style={{ opacity: 0.9, marginTop: 10 }}>
            Words: {scriptWords.length} | Rate: {wordsPerSecond > 0 ? `${wordsPerSecond.toFixed(1)} words/sec` : 'N/A'}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
