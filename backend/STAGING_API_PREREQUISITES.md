# Staging API Prerequisites Guide

This document outlines all prerequisites needed to create and work properly with the staging API environment.

## Table of Contents
1. [Environment Configuration](#environment-configuration)
2. [Database Setup](#database-setup)
3. [EveryCRED API Configuration](#everycred-api-configuration)
4. [Security & Authentication](#security--authentication)
5. [CORS Configuration](#cors-configuration)
6. [Frontend Integration](#frontend-integration)
7. [Email Configuration](#email-configuration)
8. [Redis Configuration](#redis-configuration)
9. [Logging Configuration](#logging-configuration)
10. [Deployment Checklist](#deployment-checklist)

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# ============================================
# Environment Type
# ============================================
ENVIRONMENT=staging
DEBUG=True

# ============================================
# Server Configuration
# ============================================
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# ============================================
# Database Configuration
# ============================================
DATABASE_URL=mysql+pymysql://user:password@staging-db-host:3306/lms_staging
DATABASE_NAME=lms_staging
DATABASE_USER=staging_user
DATABASE_PASSWORD=staging_password
DATABASE_HOST=staging-db-host
DATABASE_PORT=3306

# ============================================
# Security Keys
# ============================================
SECRET_KEY=your-staging-secret-key-min-32-chars
SESSION_SECRET_KEY=your-staging-session-secret-key-min-32-chars
JWT_SECRET_KEY=your-staging-jwt-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================
# Redis Configuration
# ============================================
REDIS_HOST=staging-redis-host
REDIS_PORT=6379
REDIS_DB=0

# ============================================
# Email Configuration
# ============================================
SMTP_HOST=smtp.staging.example.com
SMTP_PORT=587
SMTP_USER=staging-email@example.com
SMTP_PASSWORD=staging-email-password
SMTP_USE_TLS=True
EMAIL_USERNAME=staging-email@example.com
DEFAULT_FROM_EMAIL=noreply-staging@everycred.com

# ============================================
# Frontend Configuration
# ============================================
FRONTEND_URL=https://staging-frontend.example.com

# ============================================
# EveryCRED API Configuration
# ============================================
EVERYCRED_API_URL=https://stg-dcs-api.everycred.com/v1
EVERYCRED_API_TOKEN=your-staging-everycred-api-token
EVERYCRED_ISSUER_ID=your-staging-issuer-id
EVERYCRED_GROUP_ID=your-staging-group-id
EVERYCRED_SUBJECT_ID=your-staging-subject-id
EVERYCRED_MOCK_MODE=False
```

---

## Database Setup

### Prerequisites
1. **Separate Staging Database**: Create a dedicated MySQL database for staging
2. **Database User**: Create a staging-specific database user with appropriate permissions
3. **Database Migrations**: Run all migrations on the staging database

### Steps

1. **Create Staging Database**:
```sql
CREATE DATABASE lms_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Create Database User**:
```sql
CREATE USER 'staging_user'@'%' IDENTIFIED BY 'staging_password';
GRANT ALL PRIVILEGES ON lms_staging.* TO 'staging_user'@'%';
FLUSH PRIVILEGES;
```

3. **Run Migrations**:
```bash
cd backend
alembic upgrade head
```

4. **Verify Database Connection**:
```bash
# Test connection
python -c "from config.db_config import engine; print('Connected!' if engine else 'Failed')"
```

---

## EveryCRED API Configuration

### Prerequisites
1. **Staging EveryCRED Account**: Access to staging EveryCRED environment
2. **API Token**: Valid staging API token from EveryCRED
3. **Issuer ID**: Staging issuer ID
4. **Group ID**: Staging group ID
5. **Subject ID**: Staging subject ID

### Configuration Steps

1. **Obtain Staging Credentials**:
   - Contact EveryCRED team for staging environment access
   - Get staging API token, issuer ID, group ID, and subject ID

2. **Update Environment Variables**:
   - Set `EVERYCRED_API_URL` to staging URL: `https://stg-dcs-api.everycred.com/v1`
   - Set `EVERYCRED_MOCK_MODE=False` for real API integration
   - Add all required IDs and token

3. **Test EveryCRED Connection**:
   - Use the credentials API endpoints to verify connection
   - Test subject creation and credential issuance

### Verification
```python
# Test EveryCRED configuration
from apps.v1.api.credentials.services.everycred_service import everycred_service

# Check if configured
if everycred_service.config.is_configured():
    print("EveryCRED is properly configured")
else:
    print("EveryCRED configuration is incomplete")
```

---

## Security & Authentication

### Required Security Keys

1. **SECRET_KEY**: 
   - Minimum 32 characters
   - Used for general application encryption
   - Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

2. **SESSION_SECRET_KEY**:
   - Minimum 32 characters
   - Used for session management
   - Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

3. **JWT_SECRET_KEY**:
   - Minimum 32 characters
   - Used for JWT token signing
   - Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### Important Notes
- **Never use production keys in staging**
- **Use different keys for each environment**
- **Store keys securely** (use environment variables, not code)
- **Rotate keys periodically**

---

## CORS Configuration

### Update CORS Settings

Modify `backend/config/cors.py` to include staging frontend URL:

```python
def get_cors_config():
    """Get CORS configuration."""
    allowed_origins = ["*"]  # Development: Allow all
    
    if settings.ENVIRONMENT == "staging":
        allowed_origins = [
            "https://staging-frontend.example.com",
            "http://localhost:3000",  # For local testing
        ]
    
    if settings.ENVIRONMENT == "production":
        allowed_origins = [
            "https://production-frontend.example.com",
        ]
    
    return {
        "allow_origins": allowed_origins,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
```

---

## Frontend Integration

### Frontend Environment Variables

Create `.env.local` or `.env.staging` in `frontend/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://staging-api.example.com/api

# EveryCRED Configuration (Client-side accessible)
NEXT_PUBLIC_EVERYCRED_API_URL=https://stg-dcs-api.everycred.com/v1
NEXT_PUBLIC_EVERYCRED_API_TOKEN=your-staging-token
NEXT_PUBLIC_EVERYCRED_ISSUER_ID=your-staging-issuer-id
NEXT_PUBLIC_EVERYCRED_GROUP_ID=your-staging-group-id
NEXT_PUBLIC_EVERYCRED_SUBJECT_ID=your-staging-subject-id
NEXT_PUBLIC_EVERYCRED_MOCK_MODE=false

# Server-side only (not prefixed with NEXT_PUBLIC_)
EVERYCRED_API_URL=https://stg-dcs-api.everycred.com/v1
EVERYCRED_API_TOKEN=your-staging-token
EVERYCRED_ISSUER_ID=your-staging-issuer-id
EVERYCRED_GROUP_ID=your-staging-group-id
EVERYCRED_SUBJECT_ID=your-staging-subject-id
EVERYCRED_MOCK_MODE=false
```

### Update API Client

The frontend API client (`frontend/lib/api-client.ts`) uses `NEXT_PUBLIC_API_URL` by default. Ensure it's set correctly for staging.

---

## Email Configuration

### SMTP Settings for Staging

1. **Use Staging Email Service**:
   - Set up a staging-specific SMTP server
   - Use staging email addresses (not production)
   - Configure email templates for staging

2. **Email Testing**:
   - Test password reset emails
   - Test credential issuance notifications
   - Verify email delivery

### Configuration Checklist
- [ ] SMTP host configured
- [ ] SMTP credentials valid
- [ ] Email templates updated for staging
- [ ] Email delivery tested

---

## Redis Configuration

### Redis Setup for Staging

1. **Separate Redis Instance**:
   - Use a dedicated Redis instance for staging
   - Configure separate database (REDIS_DB) if using shared instance

2. **Configuration**:
   - Set `REDIS_HOST` to staging Redis server
   - Set `REDIS_PORT` (default: 6379)
   - Set `REDIS_DB` to staging-specific database number

3. **Verification**:
```python
# Test Redis connection
from config.redis_config import get_redis

redis_client = get_redis()
try:
    redis_client.ping()
    print("Redis connection successful")
except Exception as e:
    print(f"Redis connection failed: {e}")
```

---

## Logging Configuration

### Logging Setup

The logging configuration automatically adapts based on `ENVIRONMENT` and `DEBUG` settings:

- **Staging**: Typically uses INFO level logging
- **File Logging**: Enabled if `logs/` directory is writable
- **Console Logging**: Always enabled

### Log Files Location
- Application logs: `backend/logs/app.log`
- Error logs: `backend/logs/error.log`

### Configuration
No additional configuration needed if environment variables are set correctly.

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured in `.env`
- [ ] Staging database created and migrated
- [ ] Redis instance configured and accessible
- [ ] EveryCRED staging credentials obtained and configured
- [ ] Security keys generated (different from production)
- [ ] CORS configured for staging frontend URL
- [ ] Email service configured
- [ ] Frontend environment variables set

### Deployment Steps

1. **Set Environment**:
```bash
export ENVIRONMENT=staging
export DEBUG=True
```

2. **Run Database Migrations**:
```bash
cd backend
alembic upgrade head
```

3. **Start Application**:
```bash
# Development mode
fastapi dev asgi.py

# Production mode (using uvicorn)
uvicorn asgi:application --host 0.0.0.0 --port 8000
```

4. **Verify Health**:
```bash
curl http://localhost:8000/health
```

### Post-Deployment Verification

- [ ] Health check endpoint returns `{"status": "healthy"}`
- [ ] Database connection working
- [ ] Redis connection working
- [ ] EveryCRED API connection working
- [ ] Authentication endpoints functional
- [ ] CORS headers present in responses
- [ ] Logging working correctly

### Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens generated correctly
- [ ] Course CRUD operations work
- [ ] Student CRUD operations work
- [ ] Credential issuance works
- [ ] EveryCRED integration functional
- [ ] Email sending works
- [ ] Frontend can connect to API

---

## Common Issues & Solutions

### Issue: Database Connection Failed
**Solution**: 
- Verify database credentials in `.env`
- Check database server is accessible
- Ensure database user has correct permissions

### Issue: EveryCRED API Not Working
**Solution**:
- Verify `EVERYCRED_MOCK_MODE=False` for real API
- Check API token is valid
- Verify all IDs (issuer, group, subject) are correct
- Test API connection independently

### Issue: CORS Errors
**Solution**:
- Update `FRONTEND_URL` in backend `.env`
- Update CORS configuration in `config/cors.py`
- Verify frontend URL matches exactly (including protocol)

### Issue: JWT Token Invalid
**Solution**:
- Verify `JWT_SECRET_KEY` is set correctly
- Ensure token expiration settings are appropriate
- Check token is being sent in Authorization header

---

## Additional Notes

1. **Environment Isolation**: Staging should be completely isolated from production
2. **Data Privacy**: Use test data only, never real user data
3. **Monitoring**: Set up monitoring and alerting for staging environment
4. **Backup**: Regular backups of staging database (less critical than production)
5. **Documentation**: Keep this document updated as configuration changes

---

## Support

For issues or questions:
1. Check application logs: `backend/logs/app.log` and `backend/logs/error.log`
2. Verify all environment variables are set correctly
3. Test each service independently (database, Redis, EveryCRED)
4. Review this document for missing configurations

