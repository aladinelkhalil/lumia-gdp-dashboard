import puppeteer from "@cloudflare/puppeteer";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const targetUrl =
    url.searchParams.get("url") || `https://${new URL(request.url).hostname}/`;
  const width = parseInt(url.searchParams.get("w") || "1440");
  const height = parseInt(url.searchParams.get("h") || "900");
  const delay = parseInt(url.searchParams.get("delay") || "1000");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Create cache key based on URL and dimensions
  const cacheKey = `screenshot:${targetUrl}:${width}x${height}`;

  try {
    // Check if screenshot is cached
    const cached = await env.CACHE.get(cacheKey, { type: "arrayBuffer" });
    if (cached) {
      return new Response(cached, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
          "X-Cache": "HIT",
        },
      });
    }

    const browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();

    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1.5,
    });

    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.evaluate(() => {
      return document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();
    });

    try {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 });
    } catch (e) {
      // Continue if network idle times out
    }

    await new Promise((resolve) => setTimeout(resolve, delay));

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    await browser.close();

    // Cache the screenshot for 1 day
    await env.CACHE.put(cacheKey, screenshot, {
      expirationTtl: 24 * 60 * 60, // 1 day
      metadata: { timestamp: Date.now() },
    });

    return new Response(screenshot, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    // Handle rate limit errors specifically
    if (
      error.message.includes("Rate limit exceeded") ||
      error.message.includes("429")
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Screenshot service temporarily unavailable due to rate limits. Please try again later.",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
