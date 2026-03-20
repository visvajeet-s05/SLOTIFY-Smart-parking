async function test() {
  try {
    const resp = await fetch('http://localhost:3000/api/edge/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lotId: 'CHENNAI_CENTRAL',
        edgeNodeId: 'edge-chennai-central-01',
        edgeToken: 'token-chennai-central-secret',
        slots: []
      })
    });
    console.log('Status:', resp.status);
    console.log('Body:', await resp.text());
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
