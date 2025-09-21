import axios from "axios";
import fs from "fs";
import path from "path";

const HERMES_URL = process.env.HERMES_BASE_URL || "https://hermes.pyth.network";
const OUT_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../src/lib/gdpIds.ts"
);

async function main() {
  const url = `${HERMES_URL}/v2/price_feeds?query=gdp`;
  const { data } = await axios.get(url, { timeout: 15000 });

  const feeds = (Array.isArray(data) ? data : []).filter((item) => {
    const description = item?.attributes?.description || "";
    return !description.toLowerCase().includes("current");
  });

  const refs = feeds
    .map((item) => ({ id: item.id, base: item?.attributes?.base }))
    .filter((x) => typeof x.id === "string" && typeof x.base === "string")
    .map((x) => {
      const m = /^GDPQ(\d)(\d{2})$/.exec(x.base);
      if (!m) return null;
      const quarter = Number(m[1]);
      const yy = Number(m[2]);
      const year = 2000 + yy;
      return { id: x.id, base: x.base, year, quarter };
    })
    .filter(Boolean);

  const header = `// AUTO-GENERATED FILE. Run \`npm run update:gdp-ids\` to refresh.\n`;
  const typeDef = `export type GdpFeedRef = { id: string; base: string; year: number; quarter: 1 | 2 | 3 | 4 };\n`;
  const arr = `export const gdpFeeds: GdpFeedRef[] = ${JSON.stringify(
    refs,
    null,
    2
  )} as const;\n`;
  const ids = `export const gdpFeedIds: string[] = gdpFeeds.map((f) => f.id);\n`;
  const extraIds = [
    "3f62a36b5c2b7f0b748b10f184d6a3261028f5284df7d99e2b2239e6f4032911", // PPI INDEX
    "9117c3ac2f9416e7554642d587122955adfb3eb6c6211de805f99f7ac935dce5", // CORE PPI (normalized without 0x)
    "bb733ae406970581ee2bce323e04943c2ff25fcfd23b98bddf6880fecd42d5b0", // PPI (normalized)
    "4c0d5dee9001331f1258546e159f7bb91357051fe9fc8252345a184a59be4ac2", // YoY
  ];
  const extra = `export const extraFeedIds: string[] = ${JSON.stringify(
    extraIds,
    null,
    2
  )};\n`;
  const all = `export const allFeedIds: string[] = [...gdpFeedIds, ...extraFeedIds];\n`;
  const content = header + "\n" + typeDef + arr + ids + extra + all;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, content, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${refs.length} GDP feed refs to ${OUT_PATH}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
