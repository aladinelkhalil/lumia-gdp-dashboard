import express from "express";
import cors from "cors";
import puppeteer, { executablePath, type Browser } from "puppeteer";

const app = express();
app.use(cors());

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

app.get("/screenshot", async (req, res) => {
  const url = String(req.query.url || "http://localhost:5173/");
  const width = Number(req.query.w || 1440);
  const height = Number(req.query.h || 900);

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });

    // Navigate with a faster strategy; then wait for fonts
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.evaluate(async () => {
      // @ts-ignore
      await (document as any).fonts?.ready?.then?.(() => null);
    });
    await page
      .waitForNetworkIdle({ idleTime: 500, timeout: 10_000 })
      .catch(() => {});

    const png = await page.screenshot({ type: "png", fullPage: true });
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
