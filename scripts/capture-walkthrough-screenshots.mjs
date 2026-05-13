// Purpose: Captures authenticated Full HD portal screenshots for the BytesAndBeyond walkthrough video.
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "demo-video", "screenshots");
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const apiUrl = process.env.API_URL || "http://localhost:5000/api";
const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const findChrome = async () => {
  for (const candidate of chromeCandidates) {
    if (await exists(candidate)) return candidate;
  }
  throw new Error("Google Chrome was not found. Set CHROME_PATH to capture screenshots.");
};

const unwrap = (payload) => payload?.data || payload;

const apiFetch = async (pathName, options = {}) => {
  const response = await fetch(`${apiUrl}${pathName}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `API request failed: ${pathName}`);
  }

  return unwrap(payload);
};

const login = async (email, password) =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

const getSessions = async () => {
  const payload = await apiFetch("/sessions?limit=100");
  return payload.items || payload.sessions || payload || [];
};

const connectToChrome = async (port) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find((target) => target.type === "page");
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch {
      // Chrome is still starting.
    }
    await wait(200);
  }

  throw new Error("Chrome DevTools endpoint did not become ready.");
};

const createCdp = async (webSocketUrl) => {
  const socket = new WebSocket(webSocketUrl);
  let id = 0;
  const pending = new Map();

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };

  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const commandId = ++id;
      pending.set(commandId, (message) => {
        if (message.error) reject(new Error(message.error.message));
        else resolve(message);
      });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });

  return { send, close: () => socket.close() };
};

const authScript = (auth) => `
  localStorage.clear();
  localStorage.setItem("theme", "dark");
  localStorage.setItem("accessToken", ${JSON.stringify(auth.accessToken)});
  localStorage.setItem("refreshToken", ${JSON.stringify(auth.refreshToken)});
  localStorage.setItem("bytesandbeyond-auth", ${JSON.stringify(
    JSON.stringify({ state: { user: auth.user }, version: 0 }),
  )});
`;

const capturePage = async ({ send }, scene, auth) => {
  await send("Page.navigate", { url: clientUrl });
  await wait(650);
  await send("Runtime.evaluate", { expression: authScript(auth) });
  await send("Page.navigate", { url: `${clientUrl}${scene.path}` });
  await wait(scene.waitMs || 1900);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await wait(250);

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true,
  });

  const filePath = path.join(outputDir, `${scene.id}.png`);
  await fs.writeFile(filePath, Buffer.from(screenshot.result.data, "base64"));
  return filePath;
};

const main = async () => {
  await fs.mkdir(outputDir, { recursive: true });

  const [adminAuth, trainerAuth, sessions] = await Promise.all([
    login("ayush@iamneo.ai", "Admin@123"),
    login("siva.prasanna.s@iamneo.ai", "Trainer@123"),
    getSessions(),
  ]);

  const completed = sessions.find((session) => session.status === "Completed" && session.topic === "System Design")
    || sessions.find((session) => session.status === "Completed")
    || sessions[0];

  if (!completed?._id) throw new Error("No session was available for admin detail pages.");

  const scenes = [
    { id: "01-trainer-dashboard", role: "trainer", path: "/trainer/dashboard", title: "Trainer Dashboard" },
    { id: "02-trainer-sessions", role: "trainer", path: "/trainer/sessions", title: "Trainer Sessions" },
    { id: "03-trainer-feedback", role: "trainer", path: "/trainer/feedback", title: "Trainer Feedback" },
    { id: "04-admin-dashboard", role: "admin", path: "/admin", title: "Admin Dashboard" },
    { id: "05-admin-sessions", role: "admin", path: "/admin/sessions", title: "Session Management" },
    { id: "06-admin-evaluate", role: "admin", path: `/admin/evaluate/${completed._id}`, title: "Evaluation Entry" },
    { id: "07-admin-feedback", role: "admin", path: "/admin/feedback", title: "Feedback Management" },
    { id: "08-admin-poster", role: "admin", path: `/admin/poster/${completed._id}`, title: "Poster Generator" },
    { id: "09-admin-announce", role: "admin", path: `/admin/announce/${completed._id}`, title: "Announcement Generator" },
    { id: "10-leaderboard", role: "admin", path: "/leaderboard", title: "Leaderboard" },
  ];

  const chrome = await findChrome();
  const port = 9351;
  const userDataDir = path.join(rootDir, "demo-video", ".chrome-profile");
  const chromeProcess = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1920,1080",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  try {
    const webSocketUrl = await connectToChrome(port);
    const cdp = await createCdp(webSocketUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const captures = [];
    for (const scene of scenes) {
      const auth = scene.role === "admin" ? adminAuth : trainerAuth;
      const filePath = await capturePage(cdp, scene, auth);
      captures.push({ ...scene, filePath });
      console.log(`Captured ${scene.title}: ${filePath}`);
    }

    await fs.writeFile(
      path.join(outputDir, "screenshots.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), clientUrl, captures }, null, 2),
    );

    cdp.close();
  } finally {
    chromeProcess.kill();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
