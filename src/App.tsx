import { useEffect, useState } from "react";
import GdpLine from "./components/GdpLine";
import GrowthBars from "./components/GrowthBars";
import BreakdownBars from "./components/BreakdownBars";
import { fetchAllLatest, computeGdpLevelsFromRates } from "./lib/pyth";
import { buildDashboardCsv, downloadCsv } from "./lib/csv";

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

  return (
    <div>
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
                className="inline-flex items-center gap-2 rounded-md border border-panel-stroke  bg-panel hover:bg-panel-stroke transition-colors duration-300 cursor-pointer px-4 py-2.5 text-xs"
              >
                <img
                  className="h-4"
                  src="/assets/icons/download.svg"
                  alt="download"
                />
                Download as CSV
              </button>
              <button className="inline-flex items-center gap-2 rounded-md border border-panel-stroke  bg-panel hover:bg-panel-stroke transition-colors duration-300 cursor-pointer px-4 py-2.5 text-xs">
                <img
                  className="h-4"
                  src="/assets/icons/image.svg"
                  alt="export"
                />
                Export PNG
              </button>
              <button className="inline-flex items-center gap-2 rounded-md border border-panel-stroke  bg-panel hover:bg-panel-stroke transition-colors duration-300 cursor-pointer px-4 py-2.5 text-xs">
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
