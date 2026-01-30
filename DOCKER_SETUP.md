# 🐳 Docker Setup Instructions

## ⚠️ Docker Daemon Not Running

The Docker daemon needs to be started before you can deploy.

### For macOS (Docker Desktop)

1. **Open Docker Desktop**
   - Find Docker Desktop in your Applications folder
   - Double-click to launch it
   - Wait for the Docker icon to appear in the menu bar
   - The icon should show "Docker Desktop is running"

2. **Verify Docker is Running**
   ```bash
   docker ps
   ```
   If this works without errors, Docker is running!

### Alternative: Start Docker from Terminal

```bash
# Open Docker Desktop
open -a Docker

# Wait a few seconds, then verify
docker ps
```

## 🚀 Once Docker is Running

Run the deployment script:

```bash
./deploy.sh
```

Or manually:

```bash
# Build and start services
docker compose up --build -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## 🔍 Troubleshooting

### "Cannot connect to Docker daemon"

**Solution**: Start Docker Desktop application

### "Docker command not found"

**Solution**: Reinstall Docker Desktop from https://www.docker.com/products/docker-desktop

### Port Already in Use

```bash
# Stop local dev servers first
# Then run Docker deployment
```

### Environment Variables Warning

Edit `.env` file and add your AWS credentials:

```bash
nano .env
# or
code .env
```

## 📋 Pre-Deployment Checklist

- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running (check menu bar)
- [ ] `.env` file exists with AWS credentials
- [ ] Ports 80 and 8000 are available
- [ ] Local dev servers are stopped

## 🎯 Quick Test

After Docker is running:

```bash
# Test Docker
docker run hello-world

# If successful, deploy HackVeda
./deploy.sh
```

## 💡 Tips

- **Keep Docker Desktop Running**: It needs to be running whenever you use Docker
- **Resource Settings**: In Docker Desktop → Settings → Resources, allocate at least:
  - CPUs: 2
  - Memory: 4GB
  - Disk: 20GB

- **Auto-start**: Enable "Start Docker Desktop when you log in" in Settings

## 🆘 Still Having Issues?

1. **Restart Docker Desktop**
   - Quit Docker Desktop completely
   - Reopen it
   - Wait for it to fully start

2. **Check Docker Status**
   ```bash
   docker info
   ```

3. **Reset Docker** (if nothing else works)
   - Docker Desktop → Troubleshoot → Reset to factory defaults
   - ⚠️ This will delete all containers and images

---

**Once Docker is running, you're ready to deploy! 🚀**
