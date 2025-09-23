import express from "express";
import cors from "cors";
import puppeteer, { executablePath } from "puppeteer";

const app = express();
app.use(cors());

app.get("/", (_req, res) => {
  res.status(200).send("ok");
});

// Maintain a single shared browser instance to avoid per-request launch cost
let sharedBrowserPromise = null;

async function getBrowser() {
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

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
      // @ts-ignore - runtime only
      await (document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve());
    });
    await page
      .waitForNetworkIdle({ idleTime: 500, timeout: 10000 })
      .catch(() => {});

    const png = await page.screenshot({ type: "png", fullPage: true });
    await page.close();

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(png);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, "0.0.0.0", async () => {
  try {
    await getBrowser();
  } catch (err) {
    console.error("Failed to pre-launch browser", err);
  }
  // eslint-disable-next-line no-console
  console.log(`Screenshot server listening on :${port}`);
});
