# Remotion TTS Foundation

A clean, foundational Remotion project with **two parallel TTS components**:
1. **Speechify API** - Cloud-based TTS service
2. **Higgs Audio** - Open-source local TTS model

Both include reusable hooks that make it easy to add TTS to any Remotion animation.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Speechify API Key

Edit `config/speechify.config.ts`:
```typescript
export const SPEECHIFY_CONFIG = {
  apiKey: 'your_api_key_here',
};
```

Or use environment variable:
```bash
export REMOTION_SPEECHIFY_API_KEY=your_api_key_here
```

### 3. Start Remotion Studio
```bash
npm run dev
```

### 4. Test the Foundation Components

1. Open `http://localhost:3000`
2. Select **"TTSTest"** composition (Speechify API)
3. Or select **"HiggsTest"** composition (requires local server - see HIGGS_SETUP.md)
4. Speech will generate automatically and play

## Foundational Components

### 1. `useSpeechifyTTS` Hook (Cloud API)

The `useSpeechifyTTS` hook uses the Speechify cloud API for TTS generation.

### Basic Usage

```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';
import { Audio } from 'remotion';

export const MyAnimation: React.FC = () => {
  const { narrationAudioPath, isGenerating, speechDuration } = useSpeechifyTTS({
    text: 'Your text here',
    voiceId: 'oliver',
    language: 'en-US',
    autoGenerate: true, // Generate automatically on mount
  });

  return (
    <AbsoluteFill>
      {/* Audio will play automatically */}
      {narrationAudioPath && (
        <Audio src={narrationAudioPath} volume={1.0} startFrom={0} />
      )}
      
      {/* Your animation content */}
    </AbsoluteFill>
  );
};
```

### Advanced Usage with Text Synchronization

```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';
import { useCurrentFrame, useVideoConfig, Audio } from 'remotion';

export const MyAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const SCRIPT = 'Your text here...';
  
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
    autoGenerate: true,
  });

  // Calculate synchronized text display
  const scriptWords = SCRIPT.split(' ');
  const wordsPerSecond = speechDuration > 0 
    ? scriptWords.length / speechDuration 
    : 2.5;
  const currentWordIndex = Math.floor((frame / fps) * wordsPerSecond);
  const displayedText = scriptWords
    .slice(0, Math.min(currentWordIndex + 1, scriptWords.length))
    .join(' ');

  return (
    <AbsoluteFill>
      {narrationAudioPath && (
        <Audio src={narrationAudioPath} volume={1.0} startFrom={0} />
      )}
      
      <div>{displayedText}</div>
    </AbsoluteFill>
  );
};
```

### Hook API

**Input Configuration:**
```typescript
interface UseSpeechifyTTSConfig {
  text: string;              // Text to convert to speech
  voiceId?: string;          // Voice ID (default: 'oliver')
  language?: string;         // Language code (default: 'en-US')
  autoGenerate?: boolean;    // Auto-generate on mount (default: true)
}
```

**Return Values:**
```typescript
interface UseSpeechifyTTSReturn {
  narrationAudioPath: string | null;  // Data URL for Remotion Audio component
  isGenerating: boolean;                // Loading state
  speechDuration: number;               // Audio duration in seconds (for sync)
  generateSpeech: () => Promise<void>;  // Manual generation function
  error: string | null;                 // Error message if generation fails
}
```

## Project Structure

```
remotion-test/
├── src/
│   ├── useSpeechifyTTS.ts        # ⭐ Foundational TTS hook (REUSABLE)
│   ├── TTSTestAnimation.tsx      # Test animation demonstrating usage
│   ├── BackgroundMusic.tsx        # Reusable background music component
│   ├── speechify.ts              # Speechify API service class
│   ├── Root.tsx                  # Composition registry
│   └── index.tsx                 # Entry point
├── config/
│   ├── speechify.config.ts       # API key configuration
│   └── music.config.ts           # Music configuration
├── public/
│   └── background-music.mp3      # Background music file
└── README.md
```

### 2. `useHiggsAudio` Hook (Local Model)

The `useHiggsAudio` hook uses the open-source higgs-audio local model for TTS generation.

```tsx
import { useHiggsAudio } from './useHiggsAudio';
import { Audio } from 'remotion';

export const MyAnimation: React.FC = () => {
  const { narrationAudioPath, isGenerating, isServerAvailable } = useHiggsAudio({
    text: 'Your text here',
    refAudio: '/path/to/voice.wav', // Optional: voice cloning
    autoGenerate: true,
  });

  return (
    <AbsoluteFill>
      {narrationAudioPath && <Audio src={narrationAudioPath} volume={1.0} />}
      {!isServerAvailable && <div>⚠️ Start higgs-audio server</div>}
    </AbsoluteFill>
  );
};
```

**Setup Required**: See [HIGGS_SETUP.md](./HIGGS_SETUP.md) for local server setup instructions.

## Key Features

### ✅ Two Parallel Components
- **Speechify**: Cloud API, no setup required (API key needed)
- **Higgs Audio**: Local model, open-source, requires server setup
- Both use identical API patterns for easy switching

### ✅ Reusable Hooks
- `useSpeechifyTTS` and `useHiggsAudio` handle all TTS complexity
- Easy to integrate into any Remotion animation
- Automatic or manual speech generation

### ✅ Remotion-Compatible
- Uses data URLs (not blob URLs) for reliable playback
- Calculates audio duration for text synchronization
- Handles all edge cases and errors

### ✅ Background Music Support
- Reusable `BackgroundMusic` component
- Automatic volume balancing
- Easy to add to any animation

## Implementation Details

### How It Works

1. **API Call**: Calls Speechify API `/v1/audio/stream` endpoint
2. **Audio Processing**: Receives MP3 audio as Blob
3. **Duration Calculation**: Decodes audio to get precise duration
4. **Data URL Conversion**: Converts Blob to data URL (Remotion-compatible)
5. **State Management**: Returns ready-to-use audio path

### Why Data URLs?

Remotion's Audio component (via mediabunny) cannot reliably access blob URLs. Data URLs embed the audio data directly, eliminating compatibility issues.

## Creating a New Animation

1. **Create your animation component**:
```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';
import { Audio } from 'remotion';

export const MyNewAnimation: React.FC = () => {
  const { narrationAudioPath } = useSpeechifyTTS({
    text: 'Your script here',
    autoGenerate: true,
  });

  return (
    <AbsoluteFill>
      {narrationAudioPath && <Audio src={narrationAudioPath} volume={1.0} />}
      {/* Your visual content */}
    </AbsoluteFill>
  );
};
```

2. **Add to Root.tsx**:
```tsx
<Composition
  id="MyNewAnimation"
  component={MyNewAnimation}
  durationInFrames={450}
  fps={30}
  width={1920}
  height={1080}
/>
```

3. **Done!** Your animation now has TTS support.

## Configuration

### Speechify API Key
`config/speechify.config.ts`:
```typescript
export const SPEECHIFY_CONFIG = {
  apiKey: process.env.REMOTION_SPEECHIFY_API_KEY || 'your_key_here',
};
```

### Background Music
`config/music.config.ts`:
```typescript
export const MUSIC_CONFIG = {
  backgroundMusicSrc: '/background-music.mp3',
  volume: 0.3,
  startFrom: 0,
  endAt: undefined,
};
```

## Troubleshooting

**Speech not generating?**
- Check API key in `config/speechify.config.ts`
- Verify API key has access to `/v1/audio/stream` endpoint
- Check browser console for errors

**Audio not playing?**
- Ensure `narrationAudioPath` is set (check `isGenerating` state)
- Verify data URL is created successfully
- Check Remotion Audio component receives valid src

**Text out of sync?**
- Ensure `speechDuration` is calculated (check it's > 0)
- Verify `wordsPerSecond` calculation is correct
- Check frame timing matches audio playback

## API Reference

### Speechify API
- **Base URL**: `https://api.sws.speechify.com`
- **TTS Endpoint**: `POST /v1/audio/stream`
- **Authentication**: Bearer token
- **Request**: `{ input: string, voice_id: string, language: string }`
- **Response**: MP3 audio blob

See `IMPLEMENTATION.md` for detailed technical documentation.

## License

MIT
