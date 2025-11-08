# Higgs Audio Setup Guide

## Overview

Higgs Audio is an open-source local TTS model that runs on your machine. This guide explains how to set up the local HTTP API server required for the `useHiggsAudio` hook.

## Prerequisites

- Python 3.10+
- CUDA-capable GPU (recommended, 24GB+ VRAM for optimal performance)
- OR CPU support (slower)

## Installation Steps (Using uv)

### 1. Clone and Install higgs-audio

The repository is already cloned in `higgs-audio/` directory. If you need to clone it:

```bash
cd /Users/ernie/Documents/Github/remotion-test
git clone https://github.com/boson-ai/higgs-audio.git
cd higgs-audio
```

### 2. Set Up Environment with uv

```bash
cd higgs-audio

# Create virtual environment with Python 3.10
uv venv --python 3.10

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Install the package
uv pip install -e .

# Install Flask for HTTP server
uv pip install flask flask-cors
```

### 3. Start HTTP API Server

A pre-configured server script is included:

```bash
cd higgs-audio
./start_server.sh
```

Or manually:

```bash
cd higgs-audio
source .venv/bin/activate
python server.py
```

The server will start on `http://localhost:8000` by default.

**Note**: The server will download the model on first run (several GB). Make sure you have:
- GPU with 24GB+ VRAM (recommended)
- OR CPU support (much slower)
- Sufficient disk space for model files

### 3. Configure Remotion Project

Edit `config/higgs.config.ts`:

```typescript
export const HIGGS_CONFIG = {
  baseUrl: 'http://localhost:8000', // Your server URL
  // ... other config
};
```

Or use environment variable:
```bash
export REMOTION_HIGGS_BASE_URL=http://localhost:8000
```

## Testing

1. Start your higgs-audio HTTP server
2. Start Remotion Studio: `npm run dev`
3. Select "HiggsTest" composition
4. Speech should generate automatically

## Troubleshooting

**Server not available?**
- Check server is running: `curl http://localhost:8000/health`
- Verify port matches config
- Check firewall settings

**Generation fails?**
- Ensure GPU has enough memory (24GB+ recommended)
- Try reducing `max_new_tokens` in config
- Check server logs for errors

**Slow generation?**
- Use GPU instead of CPU
- Reduce `max_new_tokens` parameter
- Consider using vLLM server for better throughput

## API Endpoints

The server should implement:

- `GET /health` - Health check endpoint
- `POST /v1/audio/generate` - Generate audio from text
  - Request body: `{ text, ref_audio?, temperature?, top_p?, top_k?, max_new_tokens? }`
  - Response: WAV audio file

## Voice Cloning

To use voice cloning, provide a `ref_audio` path in your hook:

```tsx
const { narrationAudioPath } = useHiggsAudio({
  text: 'Your text',
  refAudio: '/path/to/reference.wav', // Voice cloning
});
```

## Resources

- [higgs-audio GitHub](https://github.com/boson-ai/higgs-audio)
- [Examples Directory](https://github.com/boson-ai/higgs-audio/tree/main/examples)
- [vLLM Server Setup](https://github.com/boson-ai/higgs-audio/tree/main/examples/vllm)
