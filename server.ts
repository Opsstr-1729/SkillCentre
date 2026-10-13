import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'submissions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read submissions
function readSubmissions(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading submissions file:', err);
  }
  return [];
}

// Helper to write submissions
function writeSubmissions(data: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving submissions file:', err);
  }
}

// POST /api/submit - records submission and forwards to Google Apps Script
app.post('/api/submit', async (req, res) => {
  try {
    const submission = req.body;
    if (!submission || !submission.centreName || !submission.department) {
      return res.status(400).json({ error: 'Missing required submission fields' });
    }

    const newRecord = {
      id: submission.id || `SUB-${Date.now().toString(36).toUpperCase()}`,
      submittedAt: submission.submittedAt || new Date().toISOString(),
      department: submission.department,
      centreName: submission.centreName,
      district: submission.district || '',
      classrooms: Number(submission.classrooms || 0),
      classroomAreas: Array.isArray(submission.classroomAreas)
        ? submission.classroomAreas.map((a: any) => Number(a || 0))
        : [],
      classroomAreasFormatted: submission.classroomAreasFormatted || '',
      computers: Number(submission.computers || 0),
      totalAreaSqFt: Number(submission.totalAreaSqFt || 0),
      address: submission.address || '',
      phone: submission.phone || '',
      email: submission.email || '',
      contactPerson: submission.contactPerson || '',
    };

    // Save locally for persistence
    const currentList = readSubmissions();
    currentList.unshift(newRecord);
    writeSubmissions(currentList);

    // Forward to Google Apps Script
    const rawEnvUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const appsScriptUrl =
      rawEnvUrl && rawEnvUrl.trim().startsWith('http')
        ? rawEnvUrl.trim()
        : 'https://script.google.com/macros/s/AKfycbxbsft3zFeOp7s_JGQaiaA9wBVMeEx4KN0-ybgIBcrqYiutZ5qemeXyJ09bubbYo1Ox/exec';
    let appsScriptForwarded = false;
    let appsScriptError = null;

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        const scriptRes = await fetch(appsScriptUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(newRecord),
          redirect: 'follow',
        });
        if (scriptRes.ok || scriptRes.status < 400) {
          appsScriptForwarded = true;
          console.log('Successfully forwarded submission to Google Apps Script:', newRecord.id);
        } else {
          appsScriptError = `Status ${scriptRes.status}: ${await scriptRes.text()}`;
          console.warn('Apps Script returned status:', scriptRes.status);
        }
      } catch (scriptErr: any) {
        appsScriptError = scriptErr.message || String(scriptErr);
        console.warn('Google Apps Script forward warning (saved locally):', scriptErr);
      }
    }

    return res.json({
      success: true,
      id: newRecord.id,
      appsScriptForwarded,
      appsScriptError,
    });
  } catch (error: any) {
    console.error('Error in /api/submit:', error);
    return res.status(500).json({ error: 'Failed to process submission' });
  }
});

// GET /api/submissions - returns list of submissions for summary view
app.get('/api/submissions', (req, res) => {
  try {
    const list = readSubmissions();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve submissions' });
  }
});

// Vite middleware setup
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
