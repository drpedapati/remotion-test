# Implementation Documentation: Foundational TTS Component

## Overview

This document details the foundational `useSpeechifyTTS` hook implementation, which provides a clean, reusable interface for integrating Speechify Text-to-Speech into Remotion animations.

## Architecture

### Core Component: `useSpeechifyTTS` Hook

**Location**: `src/useSpeechifyTTS.ts`

**Purpose**: Provides a simple, reusable hook that abstracts all TTS complexity

**Key Features**:
- Automatic or manual speech generation
- Data URL conversion for Remotion compatibility
- Audio duration calculation for text synchronization
- Error handling and loading states
- Clean API for easy integration

### Component Flow

```
useSpeechifyTTS Hook
├── Initialize SpeechifyService
├── Initialize AudioContext
├── Auto-generate (if enabled)
└── Return: { narrationAudioPath, isGenerating, speechDuration, generateSpeech, error }
    ↓
Remotion Animation Component
├── Use hook with text
├── Get narrationAudioPath
└── Pass to Remotion Audio component
```

## Implementation Details

### Data URL Conversion

**Problem**: Remotion's Audio component cannot reliably access blob URLs

**Solution**: Convert Blob to data URL using `FileReader.readAsDataURL()`

**Code** (`src/useSpeechifyTTS.ts` lines 60-66):
```typescript
const reader = new FileReader();
reader.onloadend = () => {
  const dataUrl = reader.result as string;
  setNarrationAudioPath(dataUrl);
};
reader.readAsDataURL(audioBlob);
```

**Why This Works**:
- Data URLs embed audio data directly (`data:audio/mpeg;base64,...`)
- Remotion's mediabunny can access data URLs without issues
- No blob URL lifecycle management needed
- Eliminates CORS and file access problems

### Audio Duration Calculation

**Purpose**: Enable text synchronization with speech playback

**Implementation**:
```typescript
const arrayBuffer = await audioBlob.arrayBuffer();
const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
setSpeechDuration(audioBuffer.duration);
```

**Usage**: Calculate words-per-second for synchronized text display

### Auto-Generation

**Feature**: Automatically generate speech when component mounts

**Implementation**:
```typescript
useEffect(() => {
  if (autoGenerate && speechifyServiceRef.current && text && !narrationAudioPath && !isGenerating) {
    generateSpeech();
  }
}, [autoGenerate, text, narrationAudioPath, isGenerating, generateSpeech]);
```

**Benefits**:
- Zero-configuration TTS integration
- Speech ready when component renders
- Can be disabled for manual control

## Usage Examples

### Example 1: Simple TTS Integration

```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';
import { Audio } from 'remotion';

export const SimpleAnimation: React.FC = () => {
  const { narrationAudioPath } = useSpeechifyTTS({
    text: 'Hello, world!',
    autoGenerate: true,
  });

  return (
    <AbsoluteFill>
      {narrationAudioPath && <Audio src={narrationAudioPath} volume={1.0} />}
      <div>Your content here</div>
    </AbsoluteFill>
  );
};
```

### Example 2: With Text Synchronization

```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';
import { useCurrentFrame, useVideoConfig, Audio } from 'remotion';

export const SyncedAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SCRIPT = 'Your long text here...';
  
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

### Example 3: Manual Control

```tsx
export const ManualAnimation: React.FC = () => {
  const { narrationAudioPath, isGenerating, generateSpeech } = useSpeechifyTTS({
    text: 'Click to generate',
    autoGenerate: false, // Manual control
  });

  return (
    <AbsoluteFill>
      {narrationAudioPath && <Audio src={narrationAudioPath} volume={1.0} />}
      <button onClick={generateSpeech} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Speech'}
      </button>
    </AbsoluteFill>
  );
};
```

## API Reference

### `useSpeechifyTTS(config)`

**Parameters:**
- `text` (string, required): Text to convert to speech
- `voiceId` (string, optional): Voice ID. Default: `'oliver'`
- `language` (string, optional): Language code. Default: `'en-US'`
- `autoGenerate` (boolean, optional): Auto-generate on mount. Default: `true`

**Returns:**
- `narrationAudioPath` (string | null): Data URL for Remotion Audio component
- `isGenerating` (boolean): Loading state
- `speechDuration` (number): Audio duration in seconds
- `generateSpeech` (function): Manual generation function
- `error` (string | null): Error message if generation fails

## File Structure

```
src/
├── useSpeechifyTTS.ts        # ⭐ Foundational hook (REUSABLE)
├── TTSTestAnimation.tsx      # Test/demo animation
├── BackgroundMusic.tsx        # Reusable music component
├── speechify.ts              # Speechify API service
├── Root.tsx                  # Composition registry
└── index.tsx                 # Entry point
```

## Dependencies

- `remotion`: Remotion framework
- `react`: React library
- `speechify.ts`: Speechify API service (internal)

## Best Practices

1. **Always check `narrationAudioPath`** before using with Audio component
2. **Use `speechDuration`** for accurate text synchronization
3. **Handle `error` state** for better UX
4. **Set `autoGenerate: false`** if you need manual control
5. **Use `isGenerating`** to show loading states

## Performance Considerations

- Data URLs can be large for long audio files
- Consider pre-generating audio for production renders
- Cache generated audio when possible
- Monitor API rate limits

## Troubleshooting

**Hook not generating speech?**
- Check `autoGenerate` is `true` or call `generateSpeech()` manually
- Verify API key is configured
- Check `error` state for details

**Audio not playing?**
- Ensure `narrationAudioPath` is not null
- Verify Remotion Audio component receives the path
- Check browser console for errors

**Text sync issues?**
- Wait for `speechDuration` to be calculated (> 0)
- Verify `wordsPerSecond` calculation
- Check frame timing matches audio playback

## Future Enhancements

- Caching layer for generated audio
- Support for multiple voice selection
- SSML support for advanced speech control
- Progress tracking for long texts
- Retry logic with exponential backoff
