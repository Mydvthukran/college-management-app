const express = require('express');
const Sentiment = require('sentiment');
const router = express.Router();

const sentimentAnalyzer = new Sentiment();

router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if the prompt is asking for feedback sentiment analysis
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('feedback')) {
      const result = sentimentAnalyzer.analyze(prompt);
      const score = result.score;
      let summary = "Mixed feedback.";
      if (score > 2) summary = "Highly positive feedback!";
      else if (score < 0) summary = "Negative sentiment detected. Needs improvement.";
      
      return res.json({ 
        response: `Feedback Analysis: Sentiment Score is ${score}. ${summary} Keywords: ${result.words.join(', ')}` 
      });
    }

    let responseText = "I'm not sure about that. Could you ask me about upcoming events, hackathons, or event rules?";

    // Offline rule-based logic
    if (lowerPrompt.includes('robotics') || lowerPrompt.includes('hackathon')) {
      responseText = "There's a Robotics Hackathon happening this Friday at 5 PM in the Main Auditorium. It matches your interests! Would you like to register?";
    } else if (lowerPrompt.includes('rules') || lowerPrompt.includes('guidelines')) {
      responseText = "For most events, you need to carry your dynamic QR code for entry. For hackathons, bring your own laptop and college ID.";
    } else if (lowerPrompt.includes('clash') || lowerPrompt.includes('schedule')) {
      responseText = "If you have a timetable clash, the system will warn you before registration. You can check your dashboard for your current schedule.";
    } else if (lowerPrompt.includes('hi') || lowerPrompt.includes('hello')) {
      responseText = "Hello! I am your offline Campus AI. Ask me about events, rules, or your schedule.";
    }

    // Small delay to simulate AI thinking
    setTimeout(() => {
      res.json({ response: responseText });
    }, 800);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Phase 3 Generative Tasks (Requires actual Gemini API Key in production)
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY' });

router.post('/generate-description', async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.json({ description: `Join us for the ultimate ${category} event: ${title}! It's going to be packed with learning and fun.` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a 2 paragraph exciting event description for a college ${category} titled "${title}".`,
    });
    
    res.json({ description: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/poster-suggestions', async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.json({ suggestions: "Use a dark background with neon highlights and bold typography." });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me 3 brief visual design suggestions for a poster for a college ${category} titled "${title}".`,
    });
    
    res.json({ suggestions: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
