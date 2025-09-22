import { useEffect, useMemo, useState } from "react";
import GdpLine from "./components/GdpLine";
import GrowthBars from "./components/GrowthBars";
import BreakdownBars from "./components/BreakdownBars";
import { fetchAllLatest, computeGdpLevelsFromRates } from "./lib/pyth";
import { buildDashboardCsv, downloadCsv } from "./lib/csv";
import { downloadElementPngViaServer } from "./lib/imageExport";

function App() {
  const [lineData, setLineData] = useState<{ date: string; value: number }[]>(
    []
  );
  const [growthData, setGrowthData] = useState<
    { label: string; value: number }[]
  >([]);
  const [breakdownData, setBreakdownData] = useState<
    { label: string; value: number }[]
  >([
    { label: "PPI", value: 0 },
    { label: "CORE PPI", value: 0 },
    { label: "PPI INDEX", value: 0 },
  ]);
  const [yoy, setYoy] = useState<number>(0);
  const [latestTrillions, setLatestTrillions] = useState<number>(0);
  const [peakTrillions, setPeakTrillions] = useState<number>(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function loadAll() {
      try {
        const { rates, breakdown, yoy } = await fetchAllLatest();
        if (!cancelled) {
          setGrowthData(rates);
          const levelSeries = computeGdpLevelsFromRates(rates, 21.54, 2020);
          setLineData(levelSeries);
          setBreakdownData(breakdown);

          if (levelSeries.length) {
            const values = levelSeries.map((d) => d.value);
            const latest = values[values.length - 1];
            const peak = Math.max(...values);
            setLatestTrillions(latest / 1_000_000_000_000);
            setPeakTrillions(peak / 1_000_000_000_000);
          }

          setYoy(yoy);
        }
      } catch {}
    }

    loadAll();
    timer = window.setInterval(loadAll, 60_000);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const shareUrl = useMemo(() => window.location.href, []);
  const shareText = "US GDP Dashboard by Lumia";

  function openShare() {
    setIsShareOpen(true);
  }

  function closeShare() {
    setIsShareOpen(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      closeShare();
    } catch {}
  }

  useEffect(() => {
    if (!isShareOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeShare();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isShareOpen]);

  // Preload external share icons to prevent flicker when opening the dialog
  useEffect(() => {
    const urls = [
      "https://cdn.simpleicons.org/x/010205",
      "https://cdn.simpleicons.org/facebook/010205",
      // LinkedIn uses inline SVG below; no network fetch needed, but keep for parity if switched back
      "https://cdn.simpleicons.org/linkedin/010205",
      "https://cdn.simpleicons.org/reddit/010205",
      "https://cdn.simpleicons.org/whatsapp/010205",
      "https://cdn.simpleicons.org/telegram/010205",
    ];
    const images: HTMLImageElement[] = urls.map((u) => {
      const img = new Image();
      img.src = u;
      return img;
    });
    return () => {
      for (const img of images) {
        img.src = "";
      }
    };
  }, []);

  // Simple timed splash screen: show for 1s, then fade out and unmount
  useEffect(() => {
    let startFadeTimer: number | undefined;
    let removeTimer: number | undefined;

    startFadeTimer = window.setTimeout(() => setIsSplashFading(true), 1_000);
    removeTimer = window.setTimeout(() => setIsSplashVisible(false), 1_400);

    return () => {
      if (startFadeTimer) window.clearTimeout(startFadeTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div>
      {isSplashVisible ? (
        <div
          className={
            "p-19 fixed inset-0 z-50 text-white bg-header " +
            (isSplashFading ? " animate-fade-out" : "")
          }
        >
          <img
            className="absolute z-10 top-24 right-0"
            src="/assets/full_map.svg"
            alt="Full Map USA"
          />
          <img
            className="absolute top-25 h-30 z-20"
            src="/assets/logos/lumia_white.svg"
            alt="Lumia"
          />
          <div className="absolute bottom-20 left-20">
            <img
              className="w-44 mb-6"
              src="/assets/us_flag_splash.svg"
              alt="US Flag"
            />
            <div className="font-integral leading-1 tracking-tight">
              <div className="text-6xl">US GDP</div>
              <div className="text-6xl">DASHBOARD</div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="relative text-white">
        <div className="h-1 bg-red w-full" />
        <header>
          <img
            className="w-full absolute top-0 -z-10"
            src="/assets/background.svg"
            alt="Header Background"
          />
        </header>
        <main className="ml-46.5 mr-33.5 mt-19">
          <img className="w-42 h-5" src="/assets/stars.svg" alt="Stars" />

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-end gap-x-3">
              <img className="w-14" src="/assets/us_flag.svg" alt="US Flag" />
              <h1 className="font-integral text-4xl tracking-tight">
                US GDP DASHBOARD
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const csv = buildDashboardCsv({
                    latestTrillions,
                    peakTrillions,
                    yoyPercent: yoy,
                    levels: lineData,
                    yearlyRates: growthData,
                    breakdown: breakdownData,
                  });
                  downloadCsv("us_gdp_dashboard.csv", csv);
                }}
                className="inline-flex uppercase items-center gap-2 rounded-md border border-panel-stroke  bg-panel hover:bg-panel-stroke transition-colors duration-300 cursor-pointer px-4 py-2.5 text-xs"
              >
                <img
                  className="h-4"
                  src="/assets/icons/download.svg"
                  alt="download"
                />
                Download as CSV
              </button>
              <button
                onClick={async () => {
                  const targetUrl = window.location.href;
                  await downloadElementPngViaServer(
                    targetUrl,
                    "us_gdp_dashboard.png"
                  );
                }}
                className="inline-flex uppercase items-center gap-2 rounded-md border border-panel-stroke  bg-panel hover:bg-panel-stroke transition-colors duration-300 cursor-pointer px-4 py-2.5 text-xs"
              >
                <img
                  className="h-4"
                  src="/assets/icons/image.svg"
                  alt="export"
                />
                Export PNG
              </button>
              <button
                onClick={openShare}
                className="inline-flex uppercase items-center gap-2 rounded-md border border-panel-stroke  bg-panel hover:bg-panel-stroke transition-colors duration-300 cursor-pointer px-4 py-2.5 text-xs"
              >
                <img
                  className="h-4"
                  src="/assets/icons/share.svg"
                  alt="share"
                />
                Share link
              </button>
            </div>
          </div>

          <div className="mt-9 flex gap-x-24">
            <div>
              <div className="flex items-center gap-2 text-sm uppercase">
                <img
                  className="h-3"
                  src="/assets/icons/calendar.svg"
                  alt="latest"
                />
                Latest
              </div>
              <div className="font-integral text-5xl">
                ${latestTrillions.toFixed(2)}T
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm uppercase">
                <img
                  className="h-3"
                  src="/assets/icons/arrow_up.svg"
                  alt="yoy"
                />
                YoY Growth
              </div>
              <div className="font-integral text-5xl">
                {yoy >= 0 ? "+" : ""}
                {yoy.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm uppercase">
                <img className="h-3" src="/assets/icons/trend.svg" alt="peak" />
                All-time Peak
              </div>
              <div className="font-integral text-5xl">
                ${peakTrillions.toFixed(2)}T
              </div>
            </div>
          </div>

          <div className="h-[53vh] mt-15 grid grid-cols-12 gap-6">
            <section className="col-span-12 lg:col-span-8 h-full rounded-xl bg-panel border border-panel-stroke flex flex-col">
              <h2 className="mb-4 text-sm font-medium uppercase p-6">
                GDP Over Time
              </h2>
              <div className="flex-1">
                {lineData.length ? (
                  <GdpLine data={lineData} />
                ) : (
                  <div className="h-full grid place-items-center">
                    Loading...
                  </div>
                )}
              </div>
            </section>
            <aside className="col-span-12 lg:col-span-4 h-full grid grid-rows-2 gap-5">
              <div className="h-full rounded-xl bg-panel border border-panel-stroke pt-6 px-6 pb-4 flex flex-col">
                <h2 className="mb-4 text-sm font-medium uppercase">
                  GDP Growth Rate
                </h2>
                <div className="flex-1">
                  <GrowthBars data={growthData} />
                </div>
              </div>
              <div className="h-full rounded-xl bg-panel border border-panel-stroke p-6 flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase">
                    GDP Breakdown
                  </h2>
                </div>
                <div className="flex-1">
                  <BreakdownBars data={breakdownData} />
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {isShareOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 animate-fade-bg"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeShare();
          }}
        >
          <div className="w-[90vw] max-w-sm rounded-xl bg-white p-5 text-panel animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium uppercase">Share</div>
              <button
                onClick={closeShare}
                className="text-xs cursor-pointer text-[#C2C1CD] hover:text-panel"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  shareText
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="h-4"
                  src="https://cdn.simpleicons.org/x/010205"
                  alt="X"
                />
                Twitter
              </a>
              <a
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="h-4"
                  src="https://cdn.simpleicons.org/facebook/010205"
                  alt="Facebook"
                />
                Facebook
              </a>
              <a
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5z"
                    fill="#010205"
                  />
                  <path
                    d="M0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.7-1.3 2.4-2.7 5-2.7 5.3 0 6.3 3.5 6.3 8v8.5h-5V16c0-1.9 0-4.3-2.6-4.3-2.6 0-3 2-3 4.1v8.2h-5V8z"
                    fill="#010205"
                  />
                </svg>
                LinkedIn
              </a>
              <a
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center"
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(
                  shareUrl
                )}&title=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="h-4"
                  src="https://cdn.simpleicons.org/reddit/010205"
                  alt="Reddit"
                />
                Reddit
              </a>
              <a
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  shareText + " " + shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="h-4"
                  src="https://cdn.simpleicons.org/whatsapp/010205"
                  alt="WhatsApp"
                />
                WhatsApp
              </a>
              <a
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center"
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="h-4"
                  src="https://cdn.simpleicons.org/telegram/010205"
                  alt="Telegram"
                />
                Telegram
              </a>
              <a
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center"
                href={`mailto:?subject=${encodeURIComponent(
                  "US GDP Dashboard"
                )}&body=${encodeURIComponent(shareText + "\n" + shareUrl)}`}
              >
                <svg
                  className="h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="#010205"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 7l8 6 8-6"
                    stroke="#010205"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Email
              </a>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 justify-center rounded-md border border-panel/20 bg-white hover:bg-[#f5f7fb] transition-colors px-3 py-2 text-center cursor-pointer"
              >
                <svg
                  className="h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="#010205"
                    strokeWidth="2"
                  />
                  <rect
                    x="4"
                    y="4"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="#010205"
                    strokeWidth="2"
                  />
                </svg>
                Copy link
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="text-sm text-panel mt-10">
        <span className="flex justify-center items-center gap-x-5 w-full">
          <a
            href="https://lumia.org"
            target="_blank"
            className="flex items-center gap-x-1.5"
          >
            Built by
            <img className="h-5" src="/assets/logos/lumia.svg" alt="Lumia" />
          </a>
          <span className="text-[#C2C1CD] font-extralight">|</span>
          <a
            href="https://pyth.network"
            target="_blank"
            className="flex items-center gap-x-1.5"
          >
            Powered by
            <img className="h-5" src="/assets/logos/pyth.svg" alt="Pyth" />
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;
