import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const targetUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
const allowedModels = (process.env.MODELS || '').split(',').filter(Boolean);

if (!allowedModels.length) {
  console.error('No models specified. Please set the MODELS environment variable.');
  process.exit(1);
}

// Middleware to check if the requested model is allowed
const validateModel = (req, res, next) => {
  const body = req.body || {};
  const model = body.model;

  if (!model) {
    return res.status(400).json({ error: 'No model specified in request' });
  }

  if (!allowedModels.includes(model)) {
    return res.status(403).json({ 
      error: 'Model not allowed',
      allowedModels
    });
  }

  next();
};

// Parse JSON bodies
app.use(express.json());

// Forward requests to Ollama
const forwardRequest = async (req, res) => {
  try {
    const response = await fetch(`${targetUrl}${req.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).send(error);
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'application/x-ndjson');
    
    // Stream the response
    for await (const chunk of response.body) {
      res.write(chunk);
    }
    res.end();
    
  } catch (error) {
    res.status(502).json({ error: 'Failed to proxy request' });
  }
};

// Apply model validation to relevant endpoints
app.post('/api/generate', validateModel, forwardRequest);
app.post('/api/chat', validateModel, forwardRequest);

// List models endpoint
app.get('/api/tags', async (req, res) => {
  try {
    const response = await fetch(`${targetUrl}/api/tags`);
    if (!response.ok) {
      return res.status(response.status).send(await response.text());
    }
    
    const data = await response.json();
    const filteredModels = data.models.filter(model => 
      allowedModels.includes(model.name)
    );
    
    res.json({ models: filteredModels });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process models' });
  }
});

const server = app.listen(port, () => {
  console.log(`Ollama Model Proxy listening on port ${port}`);
  console.log(`Proxying requests to ${targetUrl}`);
  console.log(`Allowed models: ${allowedModels.join(', ')}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
