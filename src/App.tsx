import { useEffect, useState } from "react";
import GdpLine from "./components/GdpLine";
import GrowthBars from "./components/GrowthBars";
import BreakdownBars from "./components/BreakdownBars";
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
      const mock = [
        { date: new Date("2020").toISOString(), value: 3_400_000 },
        { date: new Date("2021").toISOString(), value: 900_000_000 },
        { date: new Date("2022").toISOString(), value: 1_900_000 },
        { date: new Date("2023").toISOString(), value: 2_500_000 },
        { date: new Date("2024").toISOString(), value: 2_200_000 },
        { date: new Date("2025").toISOString(), value: 1_300_000 },
      ];
      setLineData(mock);
      setGrowthData([
        { label: "2020", value: 3.4 },
        { label: "2021", value: 5.9 },
        { label: "2022", value: 1.9 },
        { label: "2023", value: 2.5 },
        { label: "2024", value: 2.2 },
        { label: "2025", value: 0.3 },
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
              <button className="inline-flex items-center gap-2 rounded-md border border-panel-stroke  bg-panel hover:bg-panel-stroke transition-colors duration-300 cursor-pointer px-4 py-2.5 text-xs">
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
              <div className="font-integral text-5xl">$27.5T</div>
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
              <div className="font-integral text-5xl">+2.4% </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm uppercase">
                <img className="h-3" src="/assets/icons/trend.svg" alt="peak" />
                All-time Peak
              </div>
              <div className="font-integral text-5xl">$27.5T</div>
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
                  <div className="text-xs text-white/60">2025 ▾</div>
                </div>
                <div className="flex-1">
                  <BreakdownBars
                    data={[
                      { label: "PPI", value: 11.43 },
                      { label: "CORE PPI", value: 17.87 },
                      { label: "PPI INDEX", value: 67.91 },
                    ]}
                  />
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
