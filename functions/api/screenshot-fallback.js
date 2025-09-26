// Fallback screenshot service that generates a simple placeholder
export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const targetUrl = url.searchParams.get('url') || `https://${new URL(request.url).hostname}/`;
  const width = parseInt(url.searchParams.get('w') || '1440');
  const height = parseInt(url.searchParams.get('h') || '900');
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1f2937"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle">
        Screenshot Unavailable
      </text>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">
        Service temporarily unavailable
      </text>
      <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="14" fill="#4b5563" text-anchor="middle">
        ${new URL(targetUrl).hostname}
      </text>
    </svg>
  `;
  
  // Convert SVG to PNG using Canvas API (if available) or return SVG
  const response = new Response(svg, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    }
  });
  
  return response;
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}