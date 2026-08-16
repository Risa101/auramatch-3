---
name: check-status
description: Check health of all AuraMatch services — frontend (Vercel), backend (Railway), database (Railway MySQL), and Gemini API. Use when user says "เช็คสถานะ", "ใช้งานได้มั้ย", or "check status".
---

Check all AuraMatch services and report their status.

## 1. Frontend (Vercel)
Check if the latest deployment is live:
```bash
vercel ls --prod 2>/dev/null | head -5
```
Expected: shows recent deployment with ✓ Ready status.

## 2. Backend (Railway)
```bash
railway status 2>/dev/null
```
Then ping the API:
```bash
curl -s https://auramatch-backend-production.up.railway.app/api/health 2>/dev/null || echo "No /api/health endpoint"
```

## 3. Railway MySQL Database
```bash
mysql -h caboose.proxy.rlwy.net -P 33764 -u root -pQlPVwKfwfqJsDWONvkLyDRkpikdqPJcJ railway -e "SELECT COUNT(*) as products FROM products; SELECT COUNT(*) as looks FROM looks;" 2>/dev/null
```

## 4. Gemini API
```bash
cd /Users/saridbutchuang/Desktop/RMWEB09/backend_auramatch && \
.venv/bin/python3 -c "
import dotenv; dotenv.load_dotenv()
import os, urllib.request, json, ssl, certifi
key = os.getenv('GEMINI_API_KEY', '')
print('API key set:', bool(key), '| Model:', os.getenv('GEMINI_IMAGE_MODEL'))
if key:
    ctx = ssl.create_default_context(cafile=certifi.where())
    url = f'https://generativelanguage.googleapis.com/v1beta/models?key={key}'
    try:
        with urllib.request.urlopen(url, context=ctx, timeout=8) as r:
            models = json.loads(r.read()).get('models', [])
            print('API reachable — models count:', len(models))
    except Exception as e:
        print('API error:', e)
"
```

## Report
Summarize results in a table:

| Service | Status | Notes |
|---------|--------|-------|
| Frontend (Vercel) | ✅/❌ | URL |
| Backend (Railway) | ✅/❌ | |
| Database (MySQL) | ✅/❌ | row counts |
| Gemini API | ✅/❌ | model name |
