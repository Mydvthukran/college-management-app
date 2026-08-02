const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Rule-Based Offline AI Description Generator
router.post('/generate-description', auth, requireRole('Organizer', 'Admin', 'Club Lead'), (req, res) => {
  const { title, category, tags } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Event title is required.' });
  }

  // Pre-defined templates based on category
  const templates = {
    Workshop: "Join us for an immersive, hands-on workshop on {title}. This session is designed for individuals looking to upgrade their practical skills in {tags}. Led by experienced professionals, you will dive deep into industry-standard practices, participate in live exercises, and walk away with actionable knowledge. Perfect for students eager to bridge the gap between theory and real-world application.",
    Hackathon: "Get ready for {title}, the ultimate test of innovation and endurance! Gather your team, brainstorm groundbreaking ideas, and code your way to glory. Focusing on themes like {tags}, this high-energy hackathon offers a platform to build, network, and showcase your talent to industry leaders. Will your team emerge victorious? Register now to find out!",
    Seminar: "We are thrilled to announce {title}, an insightful seminar exploring the latest trends in {tags}. Featuring guest speakers and thought leaders, this event will provide a comprehensive overview of current challenges and future opportunities in the field. Don't miss this chance to expand your perspective and network with peers.",
    Sports: "Time to sweat it out at {title}! Whether you're playing for the trophy or just for fun, this event celebrates sportsmanship, teamwork, and athleticism. Grab your gear, represent your team, and show us what you've got on the field. May the best team win!",
    Cultural: "Experience the vibrant spirit of our campus at {title}! An evening filled with mesmerizing performances, music, dance, and art. Celebrating themes of {tags}, this cultural extravaganza is the perfect opportunity to unwind, cheer for your friends, and witness incredible student talent.",
    Fest: "Welcome to {title}, the biggest college fest of the year! Expect days packed with thrilling competitions, spectacular pro-shows, and unforgettable memories. With a diverse range of activities covering {tags}, there's something for everyone. Be a part of the legacy!",
    Competition: "Step up to the challenge at {title}! Prove your expertise in {tags} as you compete against the brightest minds on campus. With exciting prizes and bragging rights on the line, this is your moment to shine. Bring your A-game!"
  };

  const defaultTemplate = "Don't miss out on {title}! This exciting event is going to be packed with learning and fun. Focusing on {tags}, it's a great opportunity to get involved on campus, meet like-minded peers, and learn something new. Secure your spot today!";

  let selectedTemplate = templates[category] || defaultTemplate;
  
  // Format tags string
  let tagsString = 'related topics';
  if (Array.isArray(tags) && tags.length > 0) {
    if (tags.length === 1) tagsString = tags[0];
    else if (tags.length === 2) tagsString = `${tags[0]} and ${tags[1]}`;
    else tagsString = `${tags.slice(0, -1).join(', ')}, and ${tags[tags.length - 1]}`;
  } else if (typeof tags === 'string' && tags.trim() !== '') {
    tagsString = tags;
  }

  // Replace placeholders
  const generatedText = selectedTemplate
    .replace('{title}', title.trim())
    .replace('{tags}', tagsString);

  res.json({ description: generatedText });
});

module.exports = router;
