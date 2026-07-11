const fetch = require('node-fetch');

async function test() {
  const promises = [1, 2, 3, 4].map(i => 
    fetch('http://localhost:3000/api/generate-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Test ${i}`,
        aspectRatio: '1:1',
        model: 'gemini-3.1-flash-lite-image'
      })
    }).then(res => res.status)
  );
  
  const results = await Promise.all(promises);
  console.log(results);
}
test();
