#!/bin/bash

# Login Flow Testing Script
# This script tests the login flow step by step

echo "=========================================="
echo "LOGIN FLOW TESTING SCRIPT"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if backend is running
echo -e "${BLUE}Step 1: Checking if backend is running...${NC}"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null)

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${RED}✗ Backend is NOT running (HTTP $BACKEND_HEALTH)${NC}"
    echo -e "${YELLOW}  → Start backend with: cd backend && fastapi dev asgi.py${NC}"
    BACKEND_RUNNING=false
fi
echo ""

# Step 2: Check backend root endpoint
if [ "$BACKEND_RUNNING" = true ]; then
    echo -e "${BLUE}Step 2: Testing backend root endpoint...${NC}"
    ROOT_RESPONSE=$(curl -s http://localhost:8000/ 2>/dev/null)
    if [ -n "$ROOT_RESPONSE" ]; then
        echo -e "${GREEN}✓ Backend root endpoint responds${NC}"
        echo "  Response: $ROOT_RESPONSE"
    else
        echo -e "${RED}✗ Backend root endpoint not responding${NC}"
    fi
    echo ""
fi

# Step 3: Check if login endpoint exists
if [ "$BACKEND_RUNNING" = true ]; then
    echo -e "${BLUE}Step 3: Testing login endpoint availability...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"test"}' \
        -w "\nHTTP_CODE:%{http_code}" 2>/dev/null)
    
    HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')
    
    if [ "$HTTP_CODE" = "422" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
        echo -e "${GREEN}✓ Login endpoint exists (HTTP $HTTP_CODE - validation/auth error expected)${NC}"
        echo "  Response: $RESPONSE_BODY"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${RED}✗ Login endpoint NOT FOUND (HTTP 404)${NC}"
        echo "  → Check if route is registered in backend/apps/server.py"
    else
        echo -e "${YELLOW}⚠ Unexpected response (HTTP $HTTP_CODE)${NC}"
        echo "  Response: $RESPONSE_BODY"
    fi
    echo ""
fi

# Step 4: Check frontend environment configuration
echo -e "${BLUE}Step 4: Checking frontend environment configuration...${NC}"
if [ -f "frontend/.env" ] || [ -f "frontend/.env.local" ]; then
    ENV_FILE=""
    if [ -f "frontend/.env.local" ]; then
        ENV_FILE="frontend/.env.local"
    else
        ENV_FILE="frontend/.env"
    fi
    
    API_URL=$(grep "NEXT_PUBLIC_API_URL" "$ENV_FILE" 2>/dev/null | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
    
    if [ -n "$API_URL" ]; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_API_URL is set${NC}"
        echo "  Value: $API_URL"
        
        # Check if it points to correct backend
        if [[ "$API_URL" == *"localhost:8000"* ]] || [[ "$API_URL" == *"127.0.0.1:8000"* ]]; then
            echo -e "${GREEN}✓ API URL points to local backend${NC}"
        else
            echo -e "${YELLOW}⚠ API URL doesn't point to localhost:8000${NC}"
            echo "  → For local development, use: http://localhost:8000/api"
        fi
    else
        echo -e "${RED}✗ NEXT_PUBLIC_API_URL is NOT set${NC}"
        echo "  → Create frontend/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000/api"
    fi
else
    echo -e "${RED}✗ No frontend .env file found${NC}"
    echo "  → Create frontend/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000/api"
fi
echo ""

# Step 5: Check API client configuration
echo -e "${BLUE}Step 5: Checking API client configuration...${NC}"
if [ -f "frontend/lib/api-client.ts" ]; then
    API_CLIENT_BASE=$(grep "API_BASE_URL" frontend/lib/api-client.ts | head -1)
    echo "  API Client uses: $API_CLIENT_BASE"
    
    # Check login endpoint path
    LOGIN_ENDPOINT=$(grep -A 5 "login:" frontend/lib/api.ts | grep '"/v1/auth/login"' | head -1)
    if [ -n "$LOGIN_ENDPOINT" ]; then
        echo -e "${GREEN}✓ Login endpoint path is correct: /v1/auth/login${NC}"
    else
        echo -e "${YELLOW}⚠ Could not verify login endpoint path${NC}"
    fi
else
    echo -e "${RED}✗ API client file not found${NC}"
fi
echo ""

# Step 6: Test actual API call simulation
echo -e "${BLUE}Step 6: Simulating frontend API call...${NC}"
if [ "$BACKEND_RUNNING" = true ] && [ -n "$API_URL" ]; then
    FULL_URL="${API_URL}/v1/auth/login"
    echo "  Full URL would be: $FULL_URL"
    
    TEST_RESPONSE=$(curl -s -X POST "$FULL_URL" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"test123"}' \
        -w "\nHTTP_CODE:%{http_code}" 2>/dev/null)
    
    TEST_HTTP_CODE=$(echo "$TEST_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    TEST_BODY=$(echo "$TEST_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')
    
    if [ "$TEST_HTTP_CODE" = "422" ] || [ "$TEST_HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✓ API call reaches backend (HTTP $TEST_HTTP_CODE)${NC}"
        echo "  → Backend is processing the request"
    elif [ "$TEST_HTTP_CODE" = "404" ]; then
        echo -e "${RED}✗ API call returns 404${NC}"
        echo "  → Check if URL is correct: $FULL_URL"
        echo "  → Expected: http://localhost:8000/api/v1/auth/login"
    else
        echo -e "${YELLOW}⚠ Unexpected response (HTTP $TEST_HTTP_CODE)${NC}"
        echo "  Response: $TEST_BODY"
    fi
else
    echo -e "${YELLOW}⚠ Skipping - backend not running or API URL not set${NC}"
fi
echo ""

# Step 7: Check CORS configuration
echo -e "${BLUE}Step 7: Checking CORS configuration...${NC}"
if [ -f "backend/config/cors.py" ]; then
    CORS_ENV=$(grep "ENVIRONMENT" backend/config/cors.py | head -1)
    if [ -n "$CORS_ENV" ]; then
        echo "  CORS config found"
    fi
    
    # Check if FRONTEND_URL is set in backend .env
    if [ -f "backend/.env" ]; then
        FRONTEND_URL=$(grep "FRONTEND_URL" backend/.env 2>/dev/null | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ -n "$FRONTEND_URL" ]; then
            echo -e "${GREEN}✓ FRONTEND_URL is set in backend: $FRONTEND_URL${NC}"
        else
            echo -e "${YELLOW}⚠ FRONTEND_URL not set in backend .env${NC}"
            echo "  → Add: FRONTEND_URL=http://localhost:3000"
        fi
    fi
else
    echo -e "${RED}✗ CORS config file not found${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "SUMMARY"
echo "=========================================="

if [ "$BACKEND_RUNNING" = false ]; then
    echo -e "${RED}❌ ISSUE: Backend is not running${NC}"
    echo "  → Start backend: cd backend && fastapi dev asgi.py"
fi

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ ISSUE: Frontend API URL not configured${NC}"
    echo "  → Create frontend/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000/api"
fi

if [ "$BACKEND_RUNNING" = true ] && [ -n "$API_URL" ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo -e "${GREEN}✓ Frontend API URL is configured${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Open browser DevTools (F12)"
    echo "  2. Go to Network tab"
    echo "  3. Try to login from frontend"
    echo "  4. Check if request appears in Network tab"
    echo "  5. Check request URL and response"
fi

echo ""
echo "=========================================="

