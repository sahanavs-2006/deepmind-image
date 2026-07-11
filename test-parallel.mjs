async function test() {
  const promises = [1, 2, 3, 4, 5, 6, 7, 8].map(i => 
    fetch('http://localhost:3000/api/generate-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Test ${i}`,
        aspectRatio: '16:9',
        model: 'gemini-3.1-flash-lite-image'
      })
    }).then(async res => {
      if (!res.ok) {
        console.log(`Failed ${i}:`, await res.text());
        return res.status;
      }
      return res.status;
    })
  );
  
  const results = await Promise.all(promises);
  console.log(results);
}
test();
