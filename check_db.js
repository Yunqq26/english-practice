const https = require('https');
https.get({hostname:'backend-production-80b8b.up.railway.app',port:443,path:'/api/trans/questions?limit=200'}, r => {
  let d='';r.on('data',c=>d+=c);r.on('end',()=>{
    const qs=JSON.parse(d);
    const m={};
    qs.forEach(q=>{m[q.module]=(m[q.module]||0)+1});
    console.log('总题数:', qs.length);
    for(const[k,v]of Object.entries(m)) console.log('  '+k+': '+v+'题');
    if(qs.length>0)console.log('\n最新一条:', qs[qs.length-1].chinese_prompt);
  });
});
