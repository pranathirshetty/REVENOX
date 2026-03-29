// app/api/hubspot/route.ts
export async function GET() {
  const apiKey = process.env.HUBSPOT_API_KEY;
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  return Response.json(await response.json());
}