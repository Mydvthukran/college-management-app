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

// Phase 3 Offline Generative Tasks
router.post('/generate-description', async (req, res) => {
  try {
    const { title, category } = req.body;
    
    // Offline rule-based description generation
    const ruleBasedDescription = `Join us for the ultimate ${category} event: ${title}! It's going to be packed with learning, fun, and networking opportunities for everyone. Register now to secure your spot.`;
    
    res.json({ description: ruleBasedDescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/poster-suggestions', async (req, res) => {
  try {
    const { title, category } = req.body;
    
    // Offline rule-based poster suggestions
    const suggestions = `1. Use a dark, sleek background with neon accents for a modern feel. 
2. Make "${title}" the largest text on the poster using a bold, sans-serif font.
3. Include an icon or abstract graphic representing ${category}.`;
    
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
