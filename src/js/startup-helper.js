/**
 * startup-helper.js
 * Manages Windows registry entry for "Start with Windows"
 * Called from main process when user toggles the setting
 */

const { app } = require('electron');
const path = require('path');

const APP_NAME = 'IndustryPulse';

function setStartup(enable) {
  if (process.platform !== 'win32') return;

  const exePath = process.execPath;

  // Use Electron's built-in login items API
  app.setLoginItemSettings({
    openAtLogin: enable,
    name: APP_NAME,
    path: exePath,
    args: ['--minimized']
  });
}

function getStartupStatus() {
  if (process.platform !== 'win32') return false;
  return app.getLoginItemSettings().openAtLogin;
}

module.exports = { setStartup, getStartupStatus };
