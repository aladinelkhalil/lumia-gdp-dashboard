import { useEffect, useState } from "react";
import GdpLine from "./components/GdpLine";
import GrowthBars from "./components/GrowthBars";
import { fetchTimeseries, mapTimeseriesToChart } from "./lib/pyth";

function App() {
  const [lineData, setLineData] = useState<{ date: string; value: number }[]>(
    []
  );
  const [growthData, setGrowthData] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    const feedId = import.meta.env.VITE_PYTH_GDP_FEED_ID || "";
    if (!feedId) {
      // fallback demo data
      const now = Date.now();
      const base = 27.5;
      const mock = Array.from({ length: 40 }).map((_, i) => ({
        date: new Date(now - (40 - i) * 30 * 24 * 3600 * 1000).toISOString(),
        value: (base - 10) * 1e12 + i * 0.25 * 1e12,
      }));
      setLineData(mock);
      setGrowthData([
        { label: "2020", value: -3.4 },
        { label: "2021", value: 5.9 },
        { label: "2022", value: 1.9 },
        { label: "2023", value: 2.5 },
        { label: "2024", value: 2.2 },
        { label: "2025", value: -0.3 },
      ]);
      return;
    }

    (async () => {
      try {
        const res = await fetchTimeseries(feedId, { interval: "1mo" });
        setLineData(mapTimeseriesToChart(res));
      } catch {}
    })();
  }, []);

  return (
    <div className="relative min-h-svh text-white">
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
        <div className="mt-10 flex items-center gap-x-3">
          <img className="w-14" src="/assets/us_flag.svg" alt="US Flag" />
          <h2>US GDP DASHBOARD</h2>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-12 lg:col-span-8 rounded-xl bg-panel p-6">
            <h2 className="mb-4 text-sm font-medium text-white/70">
              US GDP DASHBOARD
            </h2>
            {lineData.length ? (
              <GdpLine data={lineData} />
            ) : (
              <div className="h-72 grid place-items-center text-white/60">
                Loading...
              </div>
            )}
          </section>
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="rounded-xl bg-panel p-6">
              <h2 className="mb-4 text-sm font-medium text-white/70">
                GDP Growth Rate
              </h2>
              <GrowthBars data={growthData} />
            </div>
            <div className="rounded-xl bg-panel p-6 h-64 grid place-items-center text-white/60">
              Breakdown
            </div>
          </aside>
        </div>
      </main>
      <footer className="mx-auto max-w-7xl p-6 text-xs text-white/50">
        Built by LUMIA • Powered by Pyth
      </footer>
    </div>
  );
}

export default App;
