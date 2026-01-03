import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const countryCode = url.searchParams.get('countrycode') || 'BR';
    const maxResults = url.searchParams.get('maxresults') || '500';
    const latitude = url.searchParams.get('latitude');
    const longitude = url.searchParams.get('longitude');
    const distance = url.searchParams.get('distance') || '50';

    let apiUrl = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=${countryCode}&maxresults=${maxResults}&compact=true&verbose=false`;

    // Add location-based filtering if coordinates provided
    if (latitude && longitude) {
      apiUrl += `&latitude=${latitude}&longitude=${longitude}&distance=${distance}&distanceunit=km`;
    }

    console.log(`Fetching EV stations from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    console.log(`Fetched ${data.length} EV stations`);

    // Transform the data to a simpler format
    const stations = data.map((station: any) => ({
      id: station.ID,
      uuid: station.UUID,
      title: station.AddressInfo?.Title || 'Unnamed Station',
      address: station.AddressInfo?.AddressLine1 || '',
      city: station.AddressInfo?.Town || '',
      state: station.AddressInfo?.StateOrProvince || '',
      postcode: station.AddressInfo?.Postcode || '',
      country: station.AddressInfo?.Country?.Title || '',
      countryCode: station.AddressInfo?.Country?.ISOCode || countryCode,
      latitude: station.AddressInfo?.Latitude,
      longitude: station.AddressInfo?.Longitude,
      operator: station.OperatorInfo?.Title || 'Desconhecido',
      operatorWebsite: station.OperatorInfo?.WebsiteURL || null,
      usageCost: station.UsageCost || 'Não informado',
      numPoints: station.NumberOfPoints || 1,
      connections: station.Connections?.map((conn: any) => ({
        id: conn.ID,
        type: conn.ConnectionType?.Title || 'Unknown',
        powerKW: conn.PowerKW || null,
        currentType: conn.CurrentType?.Title || null,
        quantity: conn.Quantity || 1,
        statusType: conn.StatusType?.Title || 'Unknown',
      })) || [],
      statusType: station.StatusType?.Title || 'Desconhecido',
      isOperational: station.StatusType?.IsOperational ?? true,
      dateLastVerified: station.DateLastVerified,
      dateCreated: station.DateCreated,
    }));

    return new Response(JSON.stringify({ stations, total: stations.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching EV stations:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
