const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const PORT = 3000;

// Create HTTP server
const server = http.createServer(app);
const io = new Server(server);

// Your Cohere API key
const apiKey = 'FAsxW4nb28ChymVLrVDG7UnDVoUDPJ7evAb054JR';

// Custom contact link
const contactLink = 'https://www.facebook.com/profile.php?id=61555393416824';

// Track the bot's name
let botName = "Maria";

// Custom response text when asked "Who are you?"
const customResponse = {
  id: "7df548de-bef5-4399-bd22-bd93b8c0fa7d",
  text: `I am ${botName}, a brilliant, sophisticated AI-assistant chatbot trained to assist human users by providing thorough responses. I am powered by Command, a large language model built by the company Cohere!`,
  creator: "Hassan John",
  meta: {
    api_version: {
      version: "unspecified",
      is_deprecated: true
    },
    warnings: [
      "Please set an API version, for more information please refer to https://docs.cohere.com/versioning-reference",
      "Version is deprecated, for more information please refer to https://docs.cohere.com/versioning-reference"
    ],
    billed_units: {
      input_tokens: 3,
      output_tokens: 41
    }
  },
  finish_reason: "COMPLETE"
};

// Function to check if the prompt is asking for bot identity
const checkWhoAreYou = (prompt) => {
  return prompt.toLowerCase().includes("who are you");
};

app.get('/generate', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a prompt in the query parameters.' });
  }

  // If the user asks "Who are you?", return the custom response with the bot's name
  if (checkWhoAreYou(prompt)) {
    return res.json({
      text: `I am ${botName}. My creator is Hassan John.`,
      contact: contactLink
    });
  }

  // If it's not "Who are you?", generate a response using the Cohere API
  try {
    const response = await axios.post('https://api.cohere.ai/generate', 
      {
        model: 'command-xlarge-nightly',
        prompt: prompt,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // Return the generated response and the contact link
    res.json({
      response: response.data,
      contact: contactLink
    });
  } catch (error) {
    res.status(500).json({ error: 'Error generating response from Cohere API', details: error.message });
  }
});

// Set up Socket.io for real-time interaction
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming messages
  socket.on('message', (message) => {
    if (checkWhoAreYou(message)) {
      socket.emit('response', `I am ${botName}. My creator is Hassan John.`);
    } else {
      // Handle other prompts
      socket.emit('response', `You said: ${message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
