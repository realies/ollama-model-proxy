# Ollama Model Proxy

[![GitHub Last Commit](https://img.shields.io/github/last-commit/realies/ollama-model-proxy?style=flat-square&logo=git&label=last%20commit)](https://github.com/realies/ollama-model-proxy/commits/main)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/realies/ollama-model-proxy/build.yml?style=flat-square&logo=github&label=build)](https://github.com/realies/ollama-model-proxy/actions)
[![Docker Pulls](https://img.shields.io/docker/pulls/realies/ollama-model-proxy?style=flat-square&logo=docker&label=pulls)](https://hub.docker.com/r/realies/ollama-model-proxy)
[![Docker Image Size](https://img.shields.io/docker/image-size/realies/ollama-model-proxy?style=flat-square&logo=docker&label=size)](https://hub.docker.com/r/realies/ollama-model-proxy)

A proxy server that limits available Ollama models to a predefined list.

## Features

- Restricts access to specific Ollama models via environment variables
- Proxies requests to an Ollama server
- Filters the models list endpoint to show only allowed models

## Usage

### Local Setup
```bash
git clone https://github.com/realies/ollama-model-proxy.git
cd ollama-model-proxy
yarn install
MODELS=llama3.2:latest,mixtral:latest yarn start
```

### Docker
```bash
# Using pre-built image
docker run -d \
  -p 3000:3000 \
  -e MODELS=llama3.2:latest,mixtral:latest \
  -e OLLAMA_HOST=http://localhost:11434 \
  realies/ollama-model-proxy:latest

# Or using docker-compose
docker compose up -d

# Or build locally
docker build -t ollama-model-proxy .
docker run -d \
  -p 3000:3000 \
  -e MODELS=llama3.2:latest,mixtral:latest \
  -e OLLAMA_HOST=http://localhost:11434 \
  ollama-model-proxy
```

### Environment Variables

- `MODELS`: Comma-separated list of allowed model names with tags (required). Example: `llama3.2:latest` or `llama3.2:latest,mixtral:latest`
- `PORT`: Server port (default: 3000)
- `OLLAMA_HOST`: Ollama server URL (default: http://localhost:11434)

### API Endpoints

- `POST /api/generate` - Generate endpoint (proxied to Ollama)
- `POST /api/chat` - Chat endpoint (proxied to Ollama)
- `GET /api/tags` - List available models (filtered)

### Example Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.2:latest", "prompt": "Hello, world!"}'
```

## Docker Notes

- The Docker image is based on Alpine Linux for minimal size
- The container runs as non-root user for security
- Multi-platform support: amd64, arm64

## License

MIT
