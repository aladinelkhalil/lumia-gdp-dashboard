import express from "express";
import cors from "cors";
import puppeteer, { executablePath } from "puppeteer";

const app = express();
app.use(cors());

app.get("/", (_req, res) => {
  res.status(200).send("ok");
});

app.get("/screenshot", async (req, res) => {
  const url = String(req.query.url || "http://localhost:5173/");
  const width = Number(req.query.w || 1440);
  const height = Number(req.query.h || 900);

  let browser = null;
  try {
    const execPath = executablePath();
    if (!execPath) {
      throw new Error("Puppeteer executablePath not resolved");
    }
    browser = await puppeteer.launch({
      executablePath: execPath,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        `--window-size=${width},${height}`,
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 800));

    const png = await page.screenshot({ type: "png", fullPage: true });
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(png);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  } finally {
    if (browser) await browser.close();
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`Screenshot server listening on :${port}`);
});
