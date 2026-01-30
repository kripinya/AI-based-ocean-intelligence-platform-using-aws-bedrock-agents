# 🐳 Docker Deployment - Quick Reference

## 🚀 One-Command Deployment

```bash
./deploy.sh
```

This script will:
- ✅ Check Docker installation
- ✅ Create `.env` if missing
- ✅ Build Docker images
- ✅ Start all services
- ✅ Show service status

## 📦 What's Included

### Services
1. **Backend** (FastAPI)
   - Port: 8000
   - Health checks enabled
   - AWS Bedrock integration
   - RAG with ChromaDB

2. **Frontend** (React + Nginx)
   - Port: 80
   - Production optimized
   - API proxy configured
   - Static asset caching

### Architecture
```
┌──────────────────────────────────────┐
│         Frontend (Nginx:80)          │
│  - React SPA                         │
│  - API Proxy to Backend              │
└──────────────┬───────────────────────┘
               │
               │ HTTP Proxy
               │
┌──────────────▼───────────────────────┐
│       Backend (FastAPI:8000)         │
│  - AWS Bedrock Integration           │
│  - RAG Engine (ChromaDB)             │
│  - ML Models                         │
└──────────────────────────────────────┘
```

## 🎯 Quick Commands

### Start Everything
```bash
docker compose up -d
```

### Stop Everything
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### Rebuild After Changes
```bash
docker compose up --build -d
```

### Check Status
```bash
docker compose ps
```

### Access Container Shell
```bash
# Backend
docker compose exec backend bash

# Frontend
docker compose exec frontend sh
```

## 🔧 Configuration

### Environment Variables

Edit `.env` in the root directory:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
GROQ_API_KEY=your_groq_key
FISHERIES_AGENT_ID=your_agent_id
FISHERIES_AGENT_ALIAS_ID=your_alias_id
OVERFISHING_AGENT_ID=your_agent_id
OVERFISHING_AGENT_ALIAS_ID=your_alias_id
```

### Port Configuration

Edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3000:80"  # Change 3000 to desired port
  backend:
    ports:
      - "9000:8000"  # Change 9000 to desired port
```

## 🌐 Access Points

After deployment:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Chatbot**: Navigate to Fisheries page → Scroll to bottom

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 80
lsof -i :80

# Or change port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker compose logs backend

# Restart specific service
docker compose restart backend
```

### Environment Variables Not Loading
```bash
# Ensure .env exists
ls -la .env

# Restart containers
docker compose down
docker compose up -d
```

### Build Errors
```bash
# Clean build
docker compose build --no-cache

# Remove everything and rebuild
docker compose down -v
docker system prune -a
docker compose up --build
```

## 📊 Health Checks

Both services have automatic health checks:

```bash
# Check health status
docker compose ps

# Manual health check
curl http://localhost:8000/docs  # Backend
curl http://localhost             # Frontend
```

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] AWS credentials are properly secured
- [ ] API keys are not hardcoded
- [ ] CORS is properly configured
- [ ] Nginx security headers are enabled

## 📈 Performance Tips

1. **Resource Limits**: Add to `docker-compose.yml`
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 4G
   ```

2. **Volume Caching**: Already configured for backend cache

3. **Multi-stage Builds**: Frontend uses multi-stage build for smaller images

## 🚢 Production Deployment

For production:

1. Use HTTPS (add SSL certificates)
2. Set up proper logging
3. Configure monitoring
4. Use Docker secrets for credentials
5. Set up automated backups
6. Configure auto-restart policies

## 📝 File Structure

```
HackVeda/
├── docker-compose.yml          # Orchestration config
├── .env                        # Environment variables
├── .env.example               # Template
├── deploy.sh                  # Quick deploy script
├── DOCKER_DEPLOYMENT.md       # Full documentation
├── backend/
│   ├── Dockerfile            # Backend image
│   ├── .dockerignore         # Exclude files
│   └── requirements.txt      # Python deps
└── Marine-Insights/
    ├── Dockerfile            # Frontend image
    ├── nginx.conf            # Nginx config
    ├── .dockerignore         # Exclude files
    └── package.json          # Node deps
```

## 🎓 Learning Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## 💡 Tips

- Use `docker compose logs -f` for real-time debugging
- Run `docker stats` to monitor resource usage
- Keep images updated with `docker compose pull`
- Use `.dockerignore` to reduce build context size
- Enable BuildKit for faster builds: `DOCKER_BUILDKIT=1`

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `docker compose logs`
2. Verify `.env` configuration
3. Ensure Docker daemon is running
4. Check port availability
5. Review `DOCKER_DEPLOYMENT.md` for detailed guide

---

**Ready to deploy? Run `./deploy.sh` and you're good to go! 🚀**
