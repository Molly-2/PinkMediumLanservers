const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Your Cohere API key
const cohereApiKey = 'FAsxW4nb28ChymVLrVDG7UnDVoUDPJ7evAb054JR';

// Endpoint to generate text from Cohere API using query parameters
app.get('/generate', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required as a query parameter' });
  }

  try {
    const response = await axios.post('https://api.cohere.ai/generate', {
      model: 'command-xlarge-nightly', // Specify model, or use the default
      prompt: prompt,
      max_tokens: 100, // Customize max tokens or other options
    }, {
      headers: {
        Authorization: `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Process the response to remove warnings or links
    const processedResponse = {
      text: response.data.text, // Extract the generated text
      contact: 'For more help, contact Hassan.' // Custom contact info
    };

    res.json(processedResponse); // Send the processed response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating text from Cohere API' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});