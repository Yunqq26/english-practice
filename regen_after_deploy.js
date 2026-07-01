const https = require('https');
const host = 'backend-production-80b8b.up.railway.app';

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({hostname:host,port:443,path:path,method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}
    }, r => { let d='';r.on('data',c=>d+=c);r.on('end',()=>resolve(JSON.parse(d))); });
    req.on('error',reject); req.write(body); req.end();
  });
}

(async () => {
  // 1. 注册 Yunqq
  try {
    const reg = await post('/api/auth/register', {username:'Yunqq',password:'88888888'});
    console.log('User:', reg.ok ? 'exists' : reg.username);
  } catch(e) { console.log('User may exist'); }

  // 2. 生成题目
  const modules = ['定语从句与名词性从句','非谓语动词','虚拟语气与条件状语从句','特殊句型','社会热点与文化词汇'];
  for (const mod of modules) {
    console.log('Generating', mod, '...');
    try {
      const result = await post('/api/trans/generate', { module: mod, count: 30 });
      console.log('  ' + JSON.stringify(result));
    } catch(e) { console.log('  Error:', e.message); }
    await new Promise(r => setTimeout(r, 2000));
  }

  // 3. 验证
  const d = await new Promise((resolve, reject) => {
    https.get({hostname:host,port:443,path:'/api/trans/questions?limit=200'}, r => {
      let b='';r.on('data',c=>b+=c);r.on('end',()=>resolve(JSON.parse(b)));
    }).on('error',reject);
  });
  console.log('\nTotal questions:', d.length);
  console.log('Done!');
})();
