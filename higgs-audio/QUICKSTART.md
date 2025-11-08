# Quick Start: Higgs Audio Server

## Prerequisites

- Python 3.10+
- `uv` package manager installed
- GPU with 24GB+ VRAM (recommended) OR CPU

## Setup (Already Done!)

The server is already set up in `higgs-audio/` directory:

```bash
cd /Users/ernie/Documents/Github/remotion-test/higgs-audio
```

## Start the Server

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

## Verify It's Running

Open another terminal and test:

```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "ok",
  "model": "bosonai/higgs-audio-v2-generation-3B-base",
  "device": "cuda",
  "cuda_available": true
}
```

## Test Audio Generation

```bash
curl -X POST http://localhost:8000/v1/audio/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test."}' \
  --output test.wav
```

## Use in Remotion

Once the server is running:

1. Start Remotion Studio: `npm run dev`
2. Select "HiggsTest" composition
3. Speech will generate automatically!

## Troubleshooting

**Server won't start?**
- Check Python version: `python3 --version` (need 3.10+)
- Activate venv: `source .venv/bin/activate`
- Check if port 8000 is available

**Model download slow?**
- First run downloads ~3-6GB model files
- Be patient, it's a one-time download

**Out of memory?**
- GPU needs 24GB+ VRAM
- Try CPU mode (set `HIGGS_DEVICE=cpu`)
- Reduce `max_new_tokens` in config

**CORS errors?**
- Server includes CORS headers
- Check server is running on correct port

## Stop the Server

Press `Ctrl+C` in the terminal running the server.
