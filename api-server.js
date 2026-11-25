import jsonServer from "json-server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("./.env", import.meta.url));
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    const value = match[2].replace(/^("|')(.*)\1$/, "$2");
    process.env[match[1]] = value;
  }
}

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;
const production = process.env.NODE_ENV === "production";
const sessionLifetimeSeconds = 60 * 60 * 8;
const localOrigins = production ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = new Set([
  ...localOrigins,
  ...(process.env.APP_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean),
]);

if (!adminEmail || !adminPassword || !sessionSecret) {
  throw new Error("Set ADMIN_EMAIL, ADMIN_PASSWORD, and SESSION_SECRET in the environment or .env file.");
}
if (adminPassword.length < 12) {
  throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
}
if (sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters.");
}

const app = jsonServer.create();
app.set("trust proxy", 1);
const router = jsonServer.router(fileURLToPath(new URL("./db.json", import.meta.url)));
const attempts = new Map();
const cookieName = production ? "__Host-edu_session" : "edu_session";
const cookieSameSite = production ? "None" : "Lax";

function sign(value) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function makeSession(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + sessionLifetimeSeconds * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSession(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookie = cookieHeader.split(";").map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`));
  if (!cookie) return null;
  const token = cookie.slice(cookieName.length + 1);
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session.email !== adminEmail || !Number.isFinite(session.exp) || session.exp <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function setSessionCookie(res, value, maxAge = sessionLifetimeSeconds) {
  const secure = production ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${cookieName}=${value}; Path=/; HttpOnly; SameSite=${cookieSameSite}; Max-Age=${maxAge}${secure}`);
}

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");

  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ error: "Origin not allowed" });
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.sendStatus(204);
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && (!origin || !allowedOrigins.has(origin))) {
    return res.status(403).json({ error: "A trusted browser origin is required" });
  }
  next();
});

app.use((req, res, next) => {
  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 25_000) return res.status(413).json({ error: "Request is too large" });
  next();
});
app.use(jsonServer.bodyParser);

app.post("/auth/login", (req, res) => {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key);
  }
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const record = attempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (record.resetAt <= now) {
    record.count = 0;
    record.resetAt = now + 15 * 60 * 1000;
  }
  if (record.count >= 8) {
    res.setHeader("Retry-After", String(Math.ceil((record.resetAt - now) / 1000)));
    return res.status(429).json({ error: "Too many sign-in attempts. Try again later." });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)) {
    record.count += 1;
    attempts.set(ip, record);
    return res.status(401).json({ error: "Email or password is incorrect" });
  }

  attempts.delete(ip);
  setSessionCookie(res, makeSession(adminEmail));
  return res.json({ email: adminEmail });
});

app.get("/auth/session", (req, res) => {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: "Not signed in" });
  return res.json({ email: session.email });
});

app.post("/auth/logout", (req, res) => {
  setSessionCookie(res, "", 0);
  return res.sendStatus(204);
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((req, res, next) => {
  if (!readSession(req)) return res.status(401).json({ error: "Sign in required" });
  next();
});

const studentFields = new Set(["cne", "nom", "prenom", "email", "telephone", "filiere", "niveau", "ville"]);
app.use((req, res, next) => {
  if (!/^\/etudiants(?:\/[^/]+)?\/?$/.test(req.path) || !["POST", "PUT", "PATCH"].includes(req.method)) return next();
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) return res.status(400).json({ error: "Invalid student data" });
  if (Object.keys(body).some(key => !studentFields.has(key))) return res.status(400).json({ error: "Unexpected student field" });
  const required = req.method === "PATCH" ? [] : ["cne", "nom", "prenom", "email", "filiere", "niveau"];
  if (required.some(key => typeof body[key] !== "string" || !body[key].trim())) return res.status(400).json({ error: "Complete all required fields" });
  if (Object.values(body).some(value => typeof value !== "string" || value.length > 200)) return res.status(400).json({ error: "Invalid field value" });
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return res.status(400).json({ error: "Invalid email address" });
  if (body.cne && body.cne.length > 30) return res.status(400).json({ error: "CNE is too long" });
  next();
});

app.use(router);

const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Student API listening on port ${port}`);
});
