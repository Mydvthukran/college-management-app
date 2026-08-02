const express = require('express');
const Setting = require('../models/Setting');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET all settings (Public or authenticated based on needs, let's keep it auth for now)
router.get('/', auth, async (req, res) => {
  try {
    const settings = await Setting.find({});
    // Convert array of {key, value} to an object
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    // Provide default values if not set
    if (!('allowNewRegistrations' in settingsObj)) settingsObj.allowNewRegistrations = true;
    if (!('autoApproveEvents' in settingsObj)) settingsObj.autoApproveEvents = false;

    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update a setting (Admin only)
router.put('/', auth, requireRole('Admin'), async (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: 'Setting key is required' });
    }

    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
