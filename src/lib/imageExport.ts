export async function downloadElementPngViaServer(
  url: string,
  filename: string
) {
  const server =
    import.meta.env.VITE_SCREENSHOT_URL || "http://localhost:8787/screenshot";
  const endpoint = new URL(server);
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("w", "1920");
  endpoint.searchParams.set("h", "1080");
  const res = await fetch(endpoint.toString());
  if (!res.ok) throw new Error(`Screenshot failed: ${res.status}`);
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
