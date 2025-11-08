# Foundational TTS Component - Usage Guide

## Quick Integration

### Step 1: Import the Hook

```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';
import { Audio } from 'remotion';
```

### Step 2: Use in Your Component

```tsx
export const MyAnimation: React.FC = () => {
  const { narrationAudioPath } = useSpeechifyTTS({
    text: 'Your text here',
    autoGenerate: true,
  });

  return (
    <AbsoluteFill>
      {narrationAudioPath && <Audio src={narrationAudioPath} volume={1.0} />}
      {/* Your content */}
    </AbsoluteFill>
  );
};
```

### Step 3: Add to Root.tsx

```tsx
<Composition
  id="MyAnimation"
  component={MyAnimation}
  durationInFrames={450}
  fps={30}
  width={1920}
  height={1080}
/>
```

**That's it!** Your animation now has TTS support.

## Complete Example with Text Sync

```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';
import { useCurrentFrame, useVideoConfig, Audio } from 'remotion';

export const MyAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SCRIPT = 'Your text here...';
  
  const { narrationAudioPath, speechDuration } = useSpeechifyTTS({
    text: SCRIPT,
    autoGenerate: true,
  });

  // Synchronize text with audio
  const words = SCRIPT.split(' ');
  const wordsPerSecond = speechDuration > 0 ? words.length / speechDuration : 2.5;
  const currentWordIndex = Math.floor((frame / fps) * wordsPerSecond);
  const displayedText = words.slice(0, currentWordIndex + 1).join(' ');

  return (
    <AbsoluteFill>
      {narrationAudioPath && <Audio src={narrationAudioPath} volume={1.0} />}
      <div>{displayedText}</div>
    </AbsoluteFill>
  );
};
```

## Hook Options

```typescript
useSpeechifyTTS({
  text: 'Required text',        // Text to convert
  voiceId: 'oliver',            // Optional: Voice ID (default: 'oliver')
  language: 'en-US',            // Optional: Language (default: 'en-US')
  autoGenerate: true,           // Optional: Auto-generate on mount (default: true)
})
```

## Return Values

```typescript
{
  narrationAudioPath: string | null,  // Use with <Audio src={narrationAudioPath} />
  isGenerating: boolean,              // Loading state
  speechDuration: number,             // Duration in seconds (for text sync)
  generateSpeech: () => Promise<void>, // Manual generation function
  error: string | null,              // Error message if any
}
```

## Files You Need

- ✅ `src/useSpeechifyTTS.ts` - Foundational hook (already included)
- ✅ `src/speechify.ts` - API service (already included)
- ✅ `config/speechify.config.ts` - API key config (you configure)

## Test It

1. Run `npm run dev`
2. Select "TTSTest" composition
3. See the foundational component in action!
