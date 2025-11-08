#!/usr/bin/env python3
"""
Higgs Audio HTTP API Server

Simple HTTP server wrapper for higgs-audio TTS model.
Provides REST API endpoints compatible with the Remotion useHiggsAudio hook.

Usage:
    python server.py

Endpoints:
    GET  /health - Health check
    POST /v1/audio/generate - Generate audio from text
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
import torchaudio
import io
import os
import sys
from typing import Optional

# Import higgs-audio modules
from boson_multimodal.serve.serve_engine import HiggsAudioServeEngine, HiggsAudioResponse
from boson_multimodal.data_types import ChatMLSample, Message

app = Flask(__name__)
CORS(app)  # Enable CORS for Remotion

# Configuration
MODEL_PATH = os.getenv("HIGGS_MODEL_PATH", "bosonai/higgs-audio-v2-generation-3B-base")
AUDIO_TOKENIZER_PATH = os.getenv("HIGGS_TOKENIZER_PATH", "bosonai/higgs-audio-v2-tokenizer")
DEVICE = os.getenv("HIGGS_DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
PORT = int(os.getenv("HIGGS_PORT", "8000"))

# Initialize engine
print(f"Initializing Higgs Audio engine...")
print(f"  Model: {MODEL_PATH}")
print(f"  Tokenizer: {AUDIO_TOKENIZER_PATH}")
print(f"  Device: {DEVICE}")
print(f"  Port: {PORT}")

try:
    serve_engine = HiggsAudioServeEngine(
        MODEL_PATH,
        AUDIO_TOKENIZER_PATH,
        device=DEVICE
    )
    print("✅ Engine initialized successfully!")
except Exception as e:
    print(f"❌ Failed to initialize engine: {e}")
    sys.exit(1)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "model": MODEL_PATH,
        "device": DEVICE,
        "cuda_available": torch.cuda.is_available()
    }), 200


@app.route('/v1/audio/generate', methods=['POST'])
def generate_audio():
    """Generate audio from text"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        text = data.get('text')
        if not text:
            return jsonify({"error": "Missing 'text' parameter"}), 400
        
        # Optional parameters
        ref_audio = data.get('ref_audio')  # Path to reference audio for voice cloning
        temperature = float(data.get('temperature', 0.3))
        top_p = float(data.get('top_p', 0.95))
        top_k = int(data.get('top_k', 50))
        max_new_tokens = int(data.get('max_new_tokens', 1024))
        
        print(f"Generating audio:")
        print(f"  Text length: {len(text)}")
        print(f"  Temperature: {temperature}")
        print(f"  Max tokens: {max_new_tokens}")
        if ref_audio:
            print(f"  Reference audio: {ref_audio}")
        
        # Prepare system prompt
        system_prompt = (
            "Generate audio following instruction.\n\n"
            "<|scene_desc_start|>\n"
            "Audio is recorded from a quiet room.\n"
            "<|scene_desc_end|>"
        )
        
        # Create messages
        messages = [
            Message(role="system", content=system_prompt),
            Message(role="user", content=text),
        ]
        
        # Generate audio
        output: HiggsAudioResponse = serve_engine.generate(
            chat_ml_sample=ChatMLSample(messages=messages),
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
            top_k=top_k,
            stop_strings=["<|end_of_text|>", "<|eot_id|>"],
        )
        
        # Convert to WAV bytes
        buffer = io.BytesIO()
        torchaudio.save(
            buffer,
            torch.from_numpy(output.audio)[None, :],
            output.sampling_rate,
            format='wav'
        )
        buffer.seek(0)
        
        print(f"✅ Generated audio: {len(output.audio)} samples, {output.sampling_rate}Hz")
        
        return send_file(
            buffer,
            mimetype='audio/wav',
            as_attachment=False,
            download_name='generated.wav'
        )
        
    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "type": type(e).__name__
        }), 500


if __name__ == '__main__':
    print(f"\n🚀 Starting Higgs Audio HTTP Server on port {PORT}")
    print(f"   Health check: http://localhost:{PORT}/health")
    print(f"   Generate endpoint: http://localhost:{PORT}/v1/audio/generate")
    print(f"\nPress Ctrl+C to stop\n")
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False,
        threaded=True
    )
