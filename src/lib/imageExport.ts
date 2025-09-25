export async function downloadElementPngViaServer(
  url: string,
  filename: string
) {
  let serverBase =
    import.meta.env.VITE_SCREENSHOT_URL || window.location.origin;
  if (!/^https?:\/\//i.test(serverBase)) {
    serverBase = `https://${serverBase}`;
  }
  const endpoint = new URL("/api/screenshot", serverBase);
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("w", "1920");
  endpoint.searchParams.set("h", "1080");
  
  const res = await fetch(endpoint.toString());
  
  if (res.status === 429) {
    // Rate limited, try fallback
    const fallbackEndpoint = new URL("/api/screenshot-fallback", serverBase);
    fallbackEndpoint.searchParams.set("url", url);
    fallbackEndpoint.searchParams.set("w", "1920");
    fallbackEndpoint.searchParams.set("h", "1080");
    
    const fallbackRes = await fetch(fallbackEndpoint.toString());
    if (fallbackRes.ok) {
      const blob = await fallbackRes.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename.replace('.png', '-placeholder.svg');
      link.click();
      URL.revokeObjectURL(link.href);
      
      // Show user notification about fallback
      alert('Screenshot service is temporarily busy. Downloaded a placeholder instead.');
      return;
    }
  }
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error || `Screenshot failed: ${res.status}`;
    throw new Error(message);
  }
  
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
