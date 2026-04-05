import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// SECURITY & COMPLIANCE (PWA & JWT)
// ==========================================
// In a production environment, JWTs MUST be stored in Secure, HttpOnly cookies.
// Example middleware configuration:
// app.use(cookieParser());
// app.post('/api/auth/login', (req, res) => {
//   ...
//   res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
// });

// ==========================================
// PERSISTENT EVENT SYNC LAYER
// ==========================================
// Replaces Redis Pub/Sub with a Transactional Outbox pattern.
// Events (e.g., 'care_logged', 'lmn_updated') are written to an 'outbox' table
// in the same transaction as the business data, then published to a message broker
// (like Kafka or Redis Streams) to guarantee at-least-once delivery.
// Example:
// db.transaction(() => {
//   db.prepare("INSERT INTO care_logs ...").run();
//   db.prepare("INSERT INTO outbox (event_type, payload) VALUES (?, ?)").run('care_logged', payload);
// })();

// Setup SQLite Database for Lead Capture
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const db = new Database(path.join(dbDir, "leads.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    city TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API Routes
app.get("/api/auth/url", (req, res) => {
  const redirectUri = req.query.redirectUri as string;
  if (!redirectUri) {
    return res.status(400).json({ error: "redirectUri is required" });
  }

  const state = Buffer.from(JSON.stringify({ redirectUri })).toString('base64');

  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    state: state,
    prompt: 'consent'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.json({ url: authUrl });
});

app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, state } = req.query;
  
  let redirectUri = '';
  try {
    const decoded = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
    redirectUri = decoded.redirectUri;
  } catch (e) {
    return res.status(400).send('Invalid state parameter');
  }

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID || '',
        client_secret: process.env.CLIENT_SECRET || '',
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Token error:', tokenData);
      return res.status(400).send(`Auth error: ${tokenData.error_description || tokenData.error}`);
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResponse.json();

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(userData)} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/api/leads", (req, res) => {
  const { name, email, city, note } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO leads (name, email, city, note) VALUES (?, ?, ?, ?)");
    stmt.run(name || "", email || "", city || "", note || "");
    res.json({ success: true, message: "Lead captured successfully" });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ success: false, error: "Failed to save lead" });
  }
});

app.get("/api/leads", (req, res) => {
  try {
    const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
    res.json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch leads" });
  }
});

// ==========================================
// OMAHA SYSTEM CROSSWALK & KBS SCORING
// ==========================================

// Mock Omaha ↔ ICD-10 Crosswalk Engine
app.post("/api/omaha/crosswalk", (req, res) => {
  const { icd10Codes } = req.body;
  
  if (!icd10Codes || !Array.isArray(icd10Codes)) {
    return res.status(400).json({ error: "icd10Codes array is required" });
  }

  // Simplified mock crosswalk mapping
  const crosswalkMap: Record<string, any> = {
    "I50.9": { problem: "27 Circulation", domain: "Physiological", lmnEligible: true, interventions: ["Cardiac rehab", "Nutrition counseling"] },
    "E11.9": { problem: "35 Nutrition", domain: "Health-Related Behaviors", lmnEligible: true, interventions: ["Nutrition counseling", "Fitness programs"] },
    "F03.90": { problem: "21 Cognition", domain: "Physiological", lmnEligible: true, interventions: ["Cognitive stimulation"] },
    "Z63.6": { problem: "13 Caretaking/parenting", domain: "Psychosocial", lmnEligible: true, interventions: ["Respite care", "Conductor Certification"] },
    "Z73.1": { problem: "07 Role change", domain: "Psychosocial", lmnEligible: true, interventions: ["Conductor Certification"] },
    "Z59.7": { problem: "01 Income", domain: "Environmental", lmnEligible: false, interventions: ["Financial counseling"] },
  };

  const mappedProblems = icd10Codes.map(code => {
    const mapping = crosswalkMap[code];
    if (mapping) {
      return { code, ...mapping };
    }
    return { code, problem: "Unmapped", lmnEligible: false };
  });

  // Generate LMN Template Data
  const lmnEligibleServices = mappedProblems
    .filter(p => p.lmnEligible)
    .flatMap(p => p.interventions);

  res.json({
    success: true,
    mappedProblems,
    lmnTemplate: {
      qualifyingConditions: mappedProblems.filter(p => p.lmnEligible).map(p => p.problem),
      recommendedServices: [...new Set(lmnEligibleServices)],
      irsPub502Eligible: lmnEligibleServices.length > 0
    }
  });
});

// Mock KBS (Knowledge, Behavior, Status) Outcome Rating
app.post("/api/omaha/kbs", (req, res) => {
  const { familyId, problem, knowledge, behavior, status, assessmentType } = req.body;

  if (!familyId || !problem || !knowledge || !behavior || !status) {
    return res.status(400).json({ error: "Missing required KBS fields" });
  }

  // In a real app, this would save to PostgreSQL (operational) and Aidbox (clinical)
  // via the Persistent Event Sync Layer.
  
  // Example Sync Event (Conceptual):
  // db.transaction(() => {
  //   db.prepare("INSERT INTO omaha_assessment ...").run();
  //   db.prepare("INSERT INTO outbox (event_type, payload) VALUES (?, ?)").run('kbs_assessed', payload);
  // })();

  res.json({
    success: true,
    message: "KBS rating recorded successfully",
    data: {
      familyId,
      problem,
      scores: { knowledge, behavior, status },
      assessmentType: assessmentType || "interim",
      timestamp: new Date().toISOString()
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
