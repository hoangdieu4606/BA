import https from 'https';

https.get('https://namdogroup.vn/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/<img[^>]+src="([^">]+)"[^>]*>/gi);
    if(matches) {
      matches.forEach(m => {
        if(m.toLowerCase().includes('logo') || m.toLowerCase().includes('namdo')) console.log(m);
      });
    }
  });
}).on('error', err => console.error(err));
