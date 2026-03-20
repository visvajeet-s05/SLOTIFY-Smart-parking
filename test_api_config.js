async function test() {
  try {
    const lotId = 'CHENNAI_CENTRAL';
    const edgeToken = 'token-chennai-central-secret';
    const url = `http://localhost:3000/api/edge/config?lotId=${lotId}&edgeToken=${edgeToken}`;
    const resp = await fetch(url);
    console.log('Status:', resp.status);
    const data = await resp.json();
    console.log('Body:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
