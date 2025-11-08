# TTS Components Comparison

## Overview

This project includes **two parallel TTS components** with identical APIs for easy switching:

1. **`useSpeechifyTTS`** - Cloud-based API (Speechify)
2. **`useHiggsAudio`** - Local open-source model (higgs-audio)

## Quick Comparison

| Feature | Speechify (`useSpeechifyTTS`) | Higgs Audio (`useHiggsAudio`) |
|---------|------------------------------|-------------------------------|
| **Type** | Cloud API | Local Model |
| **Setup** | API key only | Server setup required |
| **Cost** | API usage fees | Free (runs locally) |
| **Privacy** | Data sent to cloud | Fully local |
| **Speed** | Fast (cloud) | Depends on hardware |
| **Voice Cloning** | ✅ Supported | ✅ Supported |
| **Offline** | ❌ Requires internet | ✅ Works offline |
| **GPU Required** | ❌ No | ✅ Recommended (24GB+) |

## Code Comparison

### Speechify (Cloud)

```tsx
import { useSpeechifyTTS } from './useSpeechifyTTS';

const { narrationAudioPath } = useSpeechifyTTS({
  text: 'Your text',
  voiceId: 'oliver',
  autoGenerate: true,
});
```

### Higgs Audio (Local)

```tsx
import { useHiggsAudio } from './useHiggsAudio';

const { narrationAudioPath, isServerAvailable } = useHiggsAudio({
  text: 'Your text',
  refAudio: '/path/to/voice.wav', // Optional
  autoGenerate: true,
});
```

## When to Use Each

### Use Speechify When:
- ✅ You want quick setup (just API key)
- ✅ You don't have GPU hardware
- ✅ You need fast generation
- ✅ You're okay with cloud dependency
- ✅ You want managed service

### Use Higgs Audio When:
- ✅ You want privacy (local processing)
- ✅ You have GPU hardware available
- ✅ You want no API costs
- ✅ You need offline capability
- ✅ You want open-source solution

## Switching Between Components

Both hooks return the same interface:

```typescript
{
  narrationAudioPath: string | null;
  isGenerating: boolean;
  speechDuration: number;
  generateSpeech: () => Promise<void>;
  error: string | null;
}
```

So you can easily swap them:

```tsx
// Switch from Speechify to Higgs Audio:
// import { useSpeechifyTTS } from './useSpeechifyTTS';
import { useHiggsAudio } from './useHiggsAudio';

const { narrationAudioPath } = useHiggsAudio({
  text: 'Same text',
  autoGenerate: true,
});
```

## Setup Requirements

### Speechify
1. Get API key from Speechify
2. Add to `config/speechify.config.ts`
3. Done!

### Higgs Audio
1. Install higgs-audio Python library
2. Set up local HTTP server (see HIGGS_SETUP.md)
3. Configure `config/higgs.config.ts`
4. Start server before using

## Test Animations

- **TTSTest** - Tests Speechify component
- **HiggsTest** - Tests Higgs Audio component

Both demonstrate the same features:
- Automatic speech generation
- Synchronized text display
- Background music
- Error handling
