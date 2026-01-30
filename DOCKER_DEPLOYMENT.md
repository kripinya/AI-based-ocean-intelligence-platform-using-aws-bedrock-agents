# 🐳 Docker Deployment Guide

This guide will help you deploy the HackVeda Ocean Intelligence application using Docker.

## 📋 Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)
- AWS credentials with Bedrock access
- Groq API key

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your actual credentials:
- AWS credentials
- Bedrock Agent IDs and Alias IDs
- Groq API key

Also update `backend/.env` with the same values.

### 2. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
```

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Nginx:80)    │
└────────┬────────┘
         │
         │ API Proxy
         │
┌────────▼────────┐
│   Backend       │
│  (FastAPI:8000) │
└─────────────────┘
```

- **Frontend**: React app served by Nginx on port 80
- **Backend**: FastAPI application on port 8000
- **Network**: Both services communicate via Docker bridge network

## 🔧 Customization

### Change Ports

Edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3000:80"  # Change 3000 to your desired port
  
  backend:
    ports:
      - "9000:8000"  # Change 9000 to your desired port
```

### Environment Variables

All environment variables can be set in:
1. `.env` file (root directory)
2. `backend/.env` file
3. Directly in `docker-compose.yml` under `environment:`

### Volume Mounts

For development with hot-reload, uncomment volume mounts in `docker-compose.yml`:

```yaml
volumes:
  - ./backend:/app
```

## 🐛 Troubleshooting

### Port Already in Use

If port 80 or 8000 is already in use:

```bash
# Find process using port
lsof -i :80
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### Container Health Check Failing

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend
```

### Environment Variables Not Loading

Ensure:
1. `.env` file exists in root directory
2. `backend/.env` exists with all required variables
3. No spaces around `=` in .env files
4. Restart containers after changing .env: `docker-compose down && docker-compose up -d`

### Build Errors

```bash
# Clean build (remove cache)
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

## 📦 Production Deployment

For production deployment:

1. **Use environment-specific .env files**
2. **Enable HTTPS** (add SSL certificates to Nginx)
3. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 4G
   ```
4. **Use Docker secrets** for sensitive data
5. **Enable logging** to external service
6. **Set up monitoring** (Prometheus, Grafana)

## 🔐 Security Notes

- Never commit `.env` files to version control
- Use Docker secrets for production
- Regularly update base images
- Scan images for vulnerabilities: `docker scan hackveda-backend`

## 📊 Health Checks

Both services have health checks configured:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8000/docs  # Backend
curl http://localhost             # Frontend
```

## 🎯 Next Steps

- Configure CI/CD pipeline
- Set up container orchestration (Kubernetes, ECS)
- Implement monitoring and alerting
- Configure backups for volumes
- Set up load balancing for scaling

## 💡 Tips

- Use `docker-compose logs -f` to monitor real-time logs
- Run `docker-compose exec backend bash` to access backend container shell
- Use `docker stats` to monitor resource usage
- Keep images updated: `docker-compose pull`

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs`
- Verify environment variables
- Ensure all required files are present
- Check Docker daemon is running

---

**Happy Deploying! 🚀**
