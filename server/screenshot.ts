import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import puppeteer, { executablePath, type Browser } from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).send("ok");
});

// Maintain a single shared browser instance to avoid launch latency per request
let sharedBrowserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (sharedBrowserPromise) return sharedBrowserPromise;

  const execPath = executablePath();
  if (!execPath) {
    throw new Error("Puppeteer executablePath not resolved");
  }

  sharedBrowserPromise = puppeteer
    .launch({
      executablePath: execPath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
    })
    .catch((err) => {
      sharedBrowserPromise = null;
      throw err;
    });

  return sharedBrowserPromise;
}

// Simple JSON cache for latest Hermes response
const DATA_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../.cache/data"
);
const DATA_FILE = path.join(DATA_DIR, "latest.json");

app.get("/cache/latest", (_req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE))
      return res.status(404).json({ error: "not_found" });
    const buf = fs.readFileSync(DATA_FILE);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.post("/cache/latest", (req, res) => {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const payload = req.body ?? {};
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.get("/screenshot", async (req, res) => {
  const url = String(req.query.url || "http://localhost:5173/");
  const width = Number(req.query.w || 1440);
  const height = Number(req.query.h || 900);
  let delayMs = Number(req.query.delay);
  if (!Number.isFinite(delayMs) || delayMs < 0) delayMs = 1000;

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1.5 });

    // Block known third-party assets that are not needed for rendering
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const urlStr = req.url();
      const type = req.resourceType();
      const isThirdParty =
        !urlStr.startsWith("http://localhost") &&
        !urlStr.startsWith("https://lumia-us-gdp-client") &&
        !urlStr.startsWith("https://lumia-us-gdp.onrender.com");
      const isHeavy = type === "media" || type === "font" || type === "image";
      if (isThirdParty && isHeavy) return req.abort();
      return req.continue();
    });

    // Navigate with a faster strategy; then wait for fonts
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.evaluate(async () => {
      // @ts-ignore
      await (document as any).fonts?.ready?.then?.(() => null);
    });
    await page
      .waitForNetworkIdle({ idleTime: 500, timeout: 10_000 })
      .catch(() => {});

    // Wait a moment to allow the app to transition past the splash screen
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const png = await page.screenshot({ type: "png", fullPage: false });
    await page.close();

    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(png);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, "0.0.0.0", async () => {
  // Pre-launch browser at startup to reduce first-request latency
  try {
    await getBrowser();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to pre-launch browser", err);
  }
  // eslint-disable-next-line no-console
  console.log(`Screenshot server listening on :${port}`);
});
