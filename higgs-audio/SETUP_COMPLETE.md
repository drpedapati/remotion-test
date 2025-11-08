# Higgs Audio Server Setup Complete ✅

## What Was Done

1. ✅ Cloned higgs-audio repository into `higgs-audio/` directory
2. ✅ Created Python 3.10 virtual environment using `uv`
3. ✅ Installed all dependencies with `uv pip install`
4. ✅ Installed higgs-audio package (`uv pip install -e .`)
5. ✅ Installed Flask and Flask-CORS for HTTP server
6. ✅ Created `server.py` - HTTP API server script
7. ✅ Created `start_server.sh` - Convenient start script
8. ✅ Updated documentation with uv-specific instructions

## Files Created

- `higgs-audio/server.py` - HTTP API server
- `higgs-audio/start_server.sh` - Start script (executable)
- `higgs-audio/QUICKSTART.md` - Quick reference guide
- Updated `HIGGS_SETUP.md` - Full setup instructions

## Next Steps

### 1. Start the Server

```bash
cd higgs-audio
./start_server.sh
```

**Note**: First run will download the model (~3-6GB), which may take time.

### 2. Verify Server is Running

In another terminal:

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

### 3. Test in Remotion

1. Ensure server is running (`./start_server.sh`)
2. Start Remotion Studio: `npm run dev`
3. Select "HiggsTest" composition
4. Speech should generate automatically!

## Server Endpoints

- `GET /health` - Health check
- `POST /v1/audio/generate` - Generate audio
  - Request: `{ "text": "Your text", "temperature": 0.3, ... }`
  - Response: WAV audio file

## Configuration

Server configuration (environment variables):
- `HIGGS_MODEL_PATH` - Model path (default: `bosonai/higgs-audio-v2-generation-3B-base`)
- `HIGGS_TOKENIZER_PATH` - Tokenizer path (default: `bosonai/higgs-audio-v2-tokenizer`)
- `HIGGS_DEVICE` - Device: `cuda` or `cpu` (default: auto-detect)
- `HIGGS_PORT` - Server port (default: `8000`)

## Troubleshooting

**Server won't start?**
- Check virtual environment is activated: `source .venv/bin/activate`
- Verify Python 3.10+: `python --version`
- Check port 8000 is available

**Model download issues?**
- First run downloads large model files
- Ensure sufficient disk space (~10GB)
- Check internet connection

**Out of memory?**
- GPU needs 24GB+ VRAM
- Try CPU mode: `HIGGS_DEVICE=cpu python server.py`
- Reduce `max_new_tokens` in requests

**Import errors?**
- Ensure venv is activated
- Reinstall: `uv pip install -e .`

## Documentation

- `QUICKSTART.md` - Quick start guide
- `HIGGS_SETUP.md` - Detailed setup instructions
- `README.md` - Main project documentation

## Status

✅ Server setup complete
✅ Ready to start and test!
