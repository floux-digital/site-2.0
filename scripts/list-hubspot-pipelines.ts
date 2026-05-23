// Run:
// $ npx tsx --env-file=.env.local scripts/list-hubspot-pipelines.ts

async function listPipelines() {
  const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
  const res = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
    headers: {
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Error fetching pipelines:', await res.text());
    return;
  }

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

listPipelines();
