# Dockerized Deployment Guide

This guide explains how to deploy the LMS Backend using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for convenience commands)

## Quick Start

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Important**: Update the following in `.env`:
- `JWT_SECRET_KEY`: Generate a secure random string
- `SECRET_KEY`: Generate a secure random string
- `SMTP_*`: Configure your email service credentials
- `EVERYCRED_*`: Configure your EveryCRED API credentials

### 2. Deploy with Docker Compose

```bash
# Build and start all services
make deploy

# Or manually:
docker-compose up -d --build
```

### 3. Run Database Migrations

```bash
# Using Make
make migrate

# Or manually:
docker-compose exec backend alembic upgrade head
```

### 4. Verify Deployment

```bash
# Check service health
make health

# Or manually check:
curl http://localhost:8000/health
```

## Service URLs

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## Common Commands

### Using Make (Recommended)

```bash
make help          # Show all available commands
make build         # Build Docker images
make up            # Start all services
make down          # Stop all services
make restart       # Restart all services
make logs          # View all logs
make logs-backend  # View backend logs only
make shell         # Open shell in backend container
make migrate       # Run database migrations
make health        # Check health of all services
make clean         # Remove all containers and volumes
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend bash
docker-compose exec backend alembic upgrade head

# Rebuild after code changes
docker-compose up -d --build
```

## Production Deployment

### 1. Update Environment Variables

Set `ENVIRONMENT=production` and `DEBUG=False` in `.env`:

```env
ENVIRONMENT=production
DEBUG=False
```

### 2. Use Production Secrets

Generate strong secrets:

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate application secret
openssl rand -hex 32
```

### 3. Configure Reverse Proxy (Optional)

For production, use a reverse proxy like Nginx or Traefik:

```nginx
# Nginx example
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Enable SSL/TLS

Use Let's Encrypt or your SSL certificate with the reverse proxy.

## Database Management

### Access MySQL

```bash
# Using Docker Compose
docker-compose exec mysql mysql -u root -p

# Or connect from host
mysql -h localhost -P 3306 -u lms_user -p
```

### Backup Database

```bash
# Create backup
docker-compose exec mysql mysqldump -u root -prootpassword lms_db > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u root -prootpassword lms_db < backup.sql
```

### Run Migrations

```bash
# Upgrade to latest
make migrate

# Create new migration
make migrate-create NAME=add_new_table

# Rollback one migration
docker-compose exec backend alembic downgrade -1
```

## Troubleshooting

### Check Service Status

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs mysql
docker-compose logs redis
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Resource Usage

```bash
docker stats
```

### Clean and Rebuild

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Common Issues

1. **Port already in use**: Change ports in `.env` or `docker-compose.yml`
2. **Database connection failed**: Wait for MySQL to be healthy, check `DATABASE_HOST` in `.env`
3. **Migration errors**: Ensure database is running and accessible
4. **Permission errors**: Check file permissions in `logs/` directory

## Monitoring

### Health Checks

All services include health checks:
- Backend: `/health` endpoint
- MySQL: `mysqladmin ping`
- Redis: `redis-cli ping`

### Logs

Logs are stored in:
- Container logs: `docker-compose logs`
- Application logs: `./logs/` directory (mounted volume)

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong secrets** - Generate random strings for JWT and session keys
3. **Limit network exposure** - Only expose necessary ports
4. **Regular updates** - Keep Docker images updated
5. **Backup database** - Regular backups of MySQL data
6. **Use secrets management** - For production, consider Docker secrets or external secret managers

## Scaling

### Scale Backend Service

```bash
# Scale to 3 instances
docker-compose up -d --scale backend=3
```

Note: For production scaling, consider:
- Load balancer (Nginx, Traefik)
- Shared Redis for sessions
- Database connection pooling (already configured)

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Run migrations if needed
make migrate
```

### Update Dependencies

```bash
# Update pyproject.toml
# Then rebuild
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Support

For issues or questions:
1. Check logs: `make logs`
2. Verify health: `make health`
3. Review this documentation
4. Check Docker and Docker Compose versions

