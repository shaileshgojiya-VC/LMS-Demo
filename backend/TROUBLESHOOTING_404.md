# Troubleshooting 404 Errors

This guide helps diagnose and fix 404 (Not Found) errors in the LMS application.

## Common Causes

### 1. Backend Server Not Running

**Symptoms:**
- Frontend shows "Unable to connect to the server"
- API calls fail with network errors
- Browser console shows CORS errors

**Solution:**
```bash
# Start the backend server
cd backend
fastapi dev asgi.py

# Or using uvicorn directly
uvicorn asgi:application --host 0.0.0.0 --port 8000 --reload
```

**Verify Backend is Running:**
```bash
# Test health endpoint
curl http://localhost:8000/health

# Should return: {"status": "healthy"}
```

---

### 2. Frontend API URL Not Configured

**Symptoms:**
- API calls go to wrong URL
- 404 errors on API endpoints
- Network tab shows requests to `undefined/api/...`

**Solution:**

1. **Check Frontend Environment Variables:**
   Create or update `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. **For Staging:**
   ```bash
   NEXT_PUBLIC_API_URL=https://staging-api.example.com/api
   ```

3. **Verify Configuration:**
   - Check `frontend/lib/api-client.ts` uses `NEXT_PUBLIC_API_URL`
   - Restart Next.js dev server after changing env vars

**Restart Frontend:**
```bash
cd frontend
npm run dev
# or
pnpm dev
```

---

### 3. Backend API Routes Not Matching

**Backend API Routes:**
- Auth: `/api/v1/auth/*`
- Courses: `/api/v1/course/*`
- Students: `/api/v1/student/*`
- Credentials: `/api/v1/credentials/*`

**Frontend API Calls Should Use:**
- `/v1/auth/login` (not `/api/v1/auth/login`)
- `/v1/course` (not `/api/v1/course`)
- `/v1/student` (not `/api/v1/student`)
- `/v1/credentials/*` (not `/api/v1/credentials/*`)

**Why?** The frontend API client adds the base URL (`/api`) automatically.

**Example:**
```typescript
// Frontend code
apiClient.get("/v1/course")

// Results in request to:
// http://localhost:8000/api/v1/course
```

---

### 4. Missing Frontend Routes

**Available Frontend Routes:**
- `/` - Welcome page
- `/login` - Login page
- `/signup` - Sign up page
- `/dashboard` - Dashboard
- `/students` - Students list
- `/courses` - Courses list
- `/credentials` - Credentials page
- `/settings` - Settings page
- `/profile` - User profile
- `/forget-password` - Password reset request
- `/reset-password` - Password reset

**If accessing a route not listed above, it will return 404.**

---

### 5. CORS Configuration Issues

**Symptoms:**
- Browser console shows CORS errors
- Preflight requests fail
- API calls blocked by browser

**Solution:**

1. **Check Backend CORS Configuration:**
   - File: `backend/config/cors.py`
   - Ensure `FRONTEND_URL` is set correctly in `.env`

2. **Update Environment Variables:**
   ```bash
   # In backend/.env
   FRONTEND_URL=http://localhost:3000
   ENVIRONMENT=development
   ```

3. **For Staging:**
   ```bash
   FRONTEND_URL=https://staging-frontend.example.com
   ENVIRONMENT=staging
   ```

---

### 6. Database Connection Issues

**Symptoms:**
- Backend starts but API calls fail
- 500 errors instead of 404
- Database connection errors in logs

**Solution:**

1. **Check Database Configuration:**
   ```bash
   # In backend/.env
   DATABASE_URL=mysql+pymysql://user:password@host:port/database
   ```

2. **Test Database Connection:**
   ```python
   python -c "from config.db_config import engine; print('Connected!' if engine else 'Failed')"
   ```

3. **Run Migrations:**
   ```bash
   cd backend
   alembic upgrade head
   ```

---

## Quick Diagnostic Checklist

### Backend Checks
- [ ] Backend server is running (`curl http://localhost:8000/health`)
- [ ] Database is accessible and migrated
- [ ] Environment variables are set correctly
- [ ] CORS is configured for frontend URL
- [ ] API routes are registered in `apps/server.py`

### Frontend Checks
- [ ] `NEXT_PUBLIC_API_URL` is set in `.env.local`
- [ ] Frontend dev server is running
- [ ] Browser console shows correct API URLs
- [ ] No CORS errors in browser console

### Network Checks
- [ ] Backend accessible at configured port (default: 8000)
- [ ] Frontend accessible at configured port (default: 3000)
- [ ] Firewall not blocking connections
- [ ] No proxy interfering with requests

---

## Testing API Endpoints

### Test Backend Health
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### Test Backend Root
```bash
curl http://localhost:8000/
# Expected: {"message": "Connected Successfully Backend Server is running"}
```

### Test API Endpoint
```bash
# Test login endpoint (should return validation error, not 404)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# If you get 404, the route is not registered
# If you get 422, the route works but validation failed (expected)
```

---

## Common Error Messages

### "This page could not be found" (Next.js)
- **Cause:** Frontend route doesn't exist
- **Solution:** Check if route exists in `frontend/app/` directory

### "Unable to connect to the server"
- **Cause:** Backend not running or wrong URL
- **Solution:** Start backend and verify `NEXT_PUBLIC_API_URL`

### "Failed to fetch"
- **Cause:** Network error, CORS issue, or backend down
- **Solution:** Check backend is running and CORS is configured

### "404 Not Found" on API calls
- **Cause:** API endpoint doesn't exist or URL is wrong
- **Solution:** Verify API route exists and URL is correct

---

## Debugging Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Look for failed requests
   - Check request URL and response

2. **Check Backend Logs:**
   ```bash
   # View backend logs
   tail -f backend/logs/app.log
   tail -f backend/logs/error.log
   ```

3. **Check Frontend Console:**
   - Look for error messages
   - Check API client configuration
   - Verify environment variables

4. **Test API Directly:**
   ```bash
   # Use curl or Postman to test endpoints
   curl http://localhost:8000/api/v1/course
   ```

---

## Environment-Specific Issues

### Development
- Use `http://localhost:8000/api` for backend
- Use `http://localhost:3000` for frontend
- Set `ENVIRONMENT=development` in backend

### Staging
- Use staging API URL: `https://staging-api.example.com/api`
- Use staging frontend URL: `https://staging-frontend.example.com`
- Set `ENVIRONMENT=staging` in backend
- Ensure CORS allows staging frontend URL

### Production
- Use production API URL
- Use production frontend URL
- Set `ENVIRONMENT=production` in backend
- Ensure CORS only allows production frontend URL

---

## Still Getting 404?

1. **Verify the exact URL** that's returning 404
2. **Check if it's a frontend route** or API endpoint
3. **Verify backend is running** and accessible
4. **Check environment variables** are loaded correctly
5. **Review logs** for more detailed error messages
6. **Test with curl/Postman** to isolate frontend vs backend issues

---

## Getting Help

If you're still experiencing issues:
1. Check the exact error message and URL
2. Review backend logs: `backend/logs/app.log` and `backend/logs/error.log`
3. Check browser console for frontend errors
4. Verify all prerequisites from `STAGING_API_PREREQUISITES.md` are met

