---
name: test-gemini
description: Test the Gemini AI image generation and face analysis endpoints on the local backend. Use when the user wants to verify Gemini is working after changing API key or model.
disable-model-invocation: true
---

Test Gemini API integration for AuraMatch backend.

## Prerequisites
- Local backend must be running on `http://127.0.0.1:5010`
- `.env` in `backend_auramatch/` must have `GEMINI_API_KEY` set

## Tests to run

### 1. Check available models for the current API key
```bash
cd /Users/saridbutchuang/Desktop/RMWEB09/backend_auramatch && \
.venv/bin/python3 -c "
import dotenv; dotenv.load_dotenv()
import os, urllib.request, json, ssl, certifi
key = os.getenv('GEMINI_API_KEY')
url = f'https://generativelanguage.googleapis.com/v1beta/models?key={key}'
ctx = ssl.create_default_context(cafile=certifi.where())
with urllib.request.urlopen(url, context=ctx, timeout=10) as r:
    models = [m['name'].split('/')[-1] for m in json.loads(r.read()).get('models', [])]
    print('Image models:', [m for m in models if 'image' in m or 'imagen' in m])
    print('Current GEMINI_IMAGE_MODEL:', os.getenv('GEMINI_IMAGE_MODEL'))
"
```

### 2. Test image generation (requires a real JPEG)
```bash
cd /Users/saridbutchuang/Desktop/RMWEB09/backend_auramatch && \
.venv/bin/python3 -c "
import dotenv; dotenv.load_dotenv()
import sys; sys.path.insert(0, '.')
import os, urllib.request, ssl, certifi
ctx = ssl.create_default_context(cafile=certifi.where())
req = urllib.request.Request('https://randomuser.me/api/portraits/women/44.jpg', headers={'User-Agent':'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
    img = r.read()
from services.gemini_service import generate_image_with_gemini
result = generate_image_with_gemini(image_bytes=img, image_mime='image/jpeg', prompt='Apply soft natural makeup.')
print('success:', result.get('success'))
print('has image:', result.get('data_url','')[:30])
print('text:', result.get('text','')[:100])
"
```

## Expected output
- `success: True`
- `has image: data:image/png;base64,...`

## Common errors
| Error | Fix |
|-------|-----|
| `429 QUOTA_EXCEEDED` | Free tier exhausted — ensure billing is enabled on Google Cloud project |
| `403 Forbidden` | Service account used instead of API key — ensure `GEMINI_SERVICE_ACCOUNT=` (empty) in `.env` |
| `400 Bad Request` | Image too small/invalid — use a real portrait photo |
| `SSL certificate error` | Run `.venv/bin/pip3 install certifi` in `backend_auramatch/` |

## Current config (as of last session)
- Model: `gemini-2.5-flash-image`
- Auth: API key only (`GEMINI_SERVICE_ACCOUNT` disabled)
- Project: `gen-lang-client-0109125531` (paid tier enabled)
