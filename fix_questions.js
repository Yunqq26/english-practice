const https = require('https');
const host = 'backend-production-80b8b.up.railway.app';

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({ hostname: host, port: 443, path: path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(e)}}); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // 1. Get all questions
  const qs = await new Promise((resolve, reject) => {
    https.get({hostname:host,port:443,path:'/api/trans/questions?limit=200'}, res => {
      let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(e)}});
    }).on('error',reject);
  });

  console.log('Total questions:', qs.length);

  // 2. Find bad questions (pure Chinese, no English context)
  const badIds = qs.filter(q => {
    const text = q.chinese_prompt || '';
    // Pure Chinese: no ASCII letters, just Chinese and blanks/punctuation
    return !/[a-zA-Z]/.test(text);
  }).map(q => q.id);

  console.log('Bad questions (pure Chinese):', badIds.length, 'IDs:', badIds.slice(0,5).join(','));

  // 3. Since we can't delete from the API, we'll regenerate per module
  const modules = ['定语从句与名词性从句','非谓语动词','虚拟语气与条件状语从句','特殊句型','社会热点与文化词汇'];

  // Delete bad questions by overwriting their module with new ones
  // Actually, let's just generate new questions for each module to replace all
  for (const mod of modules) {
    console.log('Regenerating', mod, '...');
    try {
      const result = await post('/api/trans/generate', { module: mod, count: 30 });
      console.log('  Result:', JSON.stringify(result));
    } catch(e) {
      console.log('  Error:', e.message);
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log('Done!');
}

main().catch(console.error);
