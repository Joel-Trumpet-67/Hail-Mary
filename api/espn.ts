export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')

  if (!path) {
    return new Response('Missing path', { status: 400 })
  }

  const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl${path}`

  try {
    const res = await fetch(espnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    })

    const data = await res.text()

    return new Response(data, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=30',
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}