
# Routing Issue Fix - 404 on `/v1/auth/forget-password`

## 🔍 Problem Identified

**Backend Logs Show:**
```
📥 Incoming request: POST /v1/auth/forget-password
📤 Response: POST /v1/auth/forget-password - Status: 404
```

**Root Cause:**
The frontend API URL is missing the `/api` prefix!

## ❌ Current Configuration (WRONG)

```bash
# frontend/.env
NEXT_PUBLIC_API_URL=http://10.38.103.204:8815
```

**What happens:**
- Frontend calls: `/v1/auth/forget-password`
- API Client constructs: `http://10.38.103.204:8815` + `/v1/auth/forget-password`
- Final URL: `http://10.38.103.204:8815/v1/auth/forget-password` ❌
- Backend expects: `/api/v1/auth/forget-password`
- Result: **404 Not Found**

## ✅ Correct Configuration

```bash
# frontend/.env
NEXT_PUBLIC_API_URL=http://10.38.103.204:8815/api
```

**What happens:**
- Frontend calls: `/v1/auth/forget-password`
- API Client constructs: `http://10.38.103.204:8815/api` + `/v1/auth/forget-password`
- Final URL: `http://10.38.103.204:8815/api/v1/auth/forget-password` ✅
- Backend route: `/api/v1/auth/forget-password` ✅
- Result: **200 OK** (or proper error response)

## 🔧 Backend Route Configuration

**Backend routes are registered with `/api` prefix:**

```python
# backend/apps/server.py (line 68-72)
app.include_router(
    auth_router,
    prefix=f"/api{constant_variable.API_V1_PREFIX}/auth",  # = "/api/v1/auth"
    tags=["auth"],
)
```

**Available endpoints:**
- `/api/v1/auth/login` ✅
- `/api/v1/auth/register` ✅
- `/api/v1/auth/forget-password` ✅
- `/api/v1/auth/reset-password` ✅
- `/api/v1/auth/refresh` ✅
- `/api/v1/auth/me` ✅

## 📝 Fix Applied

The `.env` file has been updated to include `/api` in the base URL.

**After the fix:**
1. **Restart the frontend dev server** (required for env vars to reload)
2. **Test the forget-password endpoint**
3. **Check backend logs** - should see requests to `/api/v1/auth/forget-password`

## 🧪 Verification

### Test the correct endpoint:
```bash
curl -X POST http://10.38.103.204:8815/api/v1/auth/forget-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

**Expected:** JSON response (not 404)

### Test the wrong endpoint (for comparison):
```bash
curl -X POST http://10.38.103.204:8815/v1/auth/forget-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

**Expected:** 404 Not Found

## 🎯 Summary

**Issue:** Missing `/api` prefix in `NEXT_PUBLIC_API_URL`
**Fix:** Add `/api` to the end of the API URL
**Status:** ✅ Fixed

**Next Steps:**
1. Restart frontend dev server
2. Test forget-password functionality
3. Verify all API calls work correctly

