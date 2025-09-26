const cacheKey = 'gdp-latest-data';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const cached = await env.CACHE.get(cacheKey);
    if (!cached) {
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return new Response(cached, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    
    // Check if we need to update (only write if data is significantly different or cache is old)
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const cachedTime = cachedData._timestamp || 0;
        const now = Date.now();
        
        // Only update if cache is older than 5 minutes
        if (now - cachedTime < 5 * 60 * 1000) {
          return new Response(JSON.stringify({ ok: true, cached: true }), {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch {
        // If parsing fails, proceed with update
      }
    }
    
    // Add timestamp to data
    const dataWithTimestamp = { ...data, _timestamp: Date.now() };
    await env.CACHE.put(cacheKey, JSON.stringify(dataWithTimestamp));
    
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: corsHeaders
  });
}