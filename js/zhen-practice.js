// ===== 汉译英 · 批注本风格 =====
const ZHEN_API = 'https://backend-production-80b8b.up.railway.app/api/trans';
let zhenState = { mode: null, questions: [], currentIdx: 0, answers: [] };

function renderPrompt(p) {
  if (!p) return '';
  return p.replace(/\(([^)]+)\)/g,'<span style="color:#7c3aed;font-style:italic;background:#f5f0ff;padding:1px 6px;border-radius:2px">($1)</span>')
    .replace(/___+/g,'<span style="display:inline-block;min-width:80px;border-bottom:3px solid #2F5D50;margin:0 4px;background:#f0faf0;border-radius:2px;padding:0 8px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
}

/* 粒子效果 */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const count = score >= 2 ? 5 : 2;
  const isPerfect = score >= 2;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.textContent = isPerfect ? '✓' : '✗';
    el.style.left = (x + (Math.random()-0.5)*40) + 'px';
    el.style.top = (y + (Math.random()-0.5)*20) + 'px';
    el.style.fontSize = (16 + Math.random()*14) + 'px';
    el.style.color = isPerfect ? '#2F5D50' : '#B23A2F';
    el.style.fontWeight = '700';
    el.style.fontFamily = '"Courier New",monospace';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const icons = ['📖','✨','🏆','⭐']; // book, sparkle, trophy, star (using simple shapes)
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.textContent = icons[i % icons.length];
    el.style.left = (x + (Math.random()-0.5)*80) + 'px';
    el.style.top = y + 'px';
    el.style.fontSize = (14 + Math.random()*10) + 'px';
    el.style.animationDelay = (i * 0.12) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

  if (!errorEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
}

/* 页面渲染 */
function renderZhenPage() {
  document.getElementById('zhenGrid').innerHTML = '<div class="zhen-notebook"><div style="text-align:center;padding:60px 0">' +
    '<div style="font-size:2.2rem;margin-bottom:12px">📝</div>' +
    '<h2 style="font-family:Georgia,serif;color:#2B2B2B;font-size:1.3rem;margin-bottom:6px">汉译英专项练习</h2>' +
    '<p style="color:#999;font-size:0.85rem;margin-bottom:28px">浙江专升本英语备考 · AI 智能批改</p>' +
    '<div class="zhen-cards">' +
    '<div class="zhen-card" onclick="startZhenDaily()"><div class="zhen-card-icon">📅</div><div class="zhen-card-title">每日五题</div><div class="zhen-card-desc">每天 5 题，覆盖不同语法模块。连续打卡养成习惯。</div><div id="zhenStreak" style="margin-top:8px;font-size:0.78rem;color:#C9A24B"></div></div>' +
    '<div class="zhen-card" onclick="showZhenFreeOptions()"><div class="zhen-card-icon">📚</div><div class="zhen-card-title">自由练习</div><div class="zhen-card-desc">按语法模块筛选，自选题量，针对性薄弱环节训练。</div></div>' +
    '</div></div></div>';
  if (currentUser) {
    fetch(ZHEN_API+'/streak/'+encodeURIComponent(currentUser.username)).then(r=>r.json()).then(d=>{
      const el=document.getElementById('zhenStreak');
      if(el) el.textContent='🔥 连续打卡 '+d.current_streak+' 天';
    }).catch(()=>{});
  }
}

async function startZhenDaily() {
  if(!currentUser){alert('请先登录');return}
  zhenState.mode='daily';zhenState.currentIdx=0;zhenState.answers=[];
  try{
    const r=await fetch(ZHEN_API+'/daily/'+encodeURIComponent(currentUser.username));
    const data=await r.json();
    if(data.empty){alert('题库为空');return}
    zhenState.questions=data.questions;
    for(const[qid,ans]of Object.entries(data.answers||{}))
      zhenState.answers[zhenState.questions.findIndex(q=>q.id==qid)]=ans;
    renderZhenQuestion();
  }catch(e){alert('加载失败');}
}

async function showZhenFreeOptions() {
  if(!currentUser){alert('请先登录');return}
  try{
    const r=await fetch(ZHEN_API+'/modules');
    const modules=await r.json();
    let mh='<option value="all">全部模块</option>';
    modules.forEach(m=>{mh+='<option value="'+m+'">'+m+'</option>'});
    document.getElementById('zhenGrid').innerHTML='<div class="zhen-notebook"><div style="max-width:500px;margin:20px auto">'+
      '<h2 style="font-family:Georgia,serif;color:#2B2B2B;margin-bottom:16px">📚 自由练习</h2>'+
      '<label style="font-size:0.82rem;color:#888;display:block;margin-bottom:4px">语法模块</label>'+
      '<select id="zhenModuleSelect" style="width:100%;padding:10px 14px;border:1px solid #DDD6C8;border-radius:0;font-size:0.9rem;font-family:inherit;margin-bottom:12px">'+mh+'</select>'+
      '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">'+
      '<button class="btn btn-outline" onclick="startZhenFree(5)">5 题</button>'+
      '<button class="btn btn-outline" onclick="startZhenFree(10)">10 题</button>'+
      '<button class="btn btn-outline" onclick="startZhenFree(20)">20 题</button>'+
      '<button class="btn btn-outline" onclick="startZhenFree(0)" style="color:#B23A2F;border-color:#B23A2F">只练错题</button></div>'+
      '<button class="btn btn-ghost" onclick="renderZhenPage()" style="font-size:0.78rem">← 返回</button></div></div>';
  }catch(e){alert('加载模块失败')}
}

async function startZhenFree(limit) {
  const mod=document.getElementById('zhenModuleSelect').value;
  const isWO=limit===0;
  try{
    const r=await fetch(ZHEN_API+'/questions?module='+encodeURIComponent(mod)+'&limit='+(isWO?50:limit)+'&wrongOnly='+isWO+'&username='+encodeURIComponent(currentUser.username));
    const qs=await r.json();
    if(!qs.length){alert('没有符合条件的题目');return}
    zhenState.mode='free';zhenState.questions=qs;zhenState.currentIdx=0;zhenState.answers=[];
    renderZhenQuestion();
  }catch(e){alert('加载失败')}
}

function renderZhenQuestion() {
  if(zhenState.currentIdx>=zhenState.questions.length){renderZhenComplete();return}
  const q=zhenState.questions[zhenState.currentIdx];
  const pos=zhenState.currentIdx+1,total=zhenState.questions.length;
  if(zhenState.answers[zhenState.currentIdx]){renderZhenResult(q,zhenState.answers[zhenState.currentIdx]);return}


  document.getElementById('zhenGrid').innerHTML='<div class="zhen-notebook">'+
    '<div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;padding:0 8px">'+
    '<span style="font-size:0.8rem;color:#888;font-family:Georgia,serif">📝 '+q.module+' · '+pos+'/'+total+'</span>'+
    '<button class="btn btn-ghost" onclick="renderZhenPage()" style="font-size:0.75rem">← 返回</button></div>'+
    '<div class="zhen-exam-sheet"><div class="exam-header">'+
    '<span style="font-weight:600">翻译填空</span>'+
    '<span style="color:#C9A24B;font-weight:600">难度 '+('★'.repeat(q.difficulty||2))+'</span></div>'+
    '<div class="exam-question">'+renderPrompt(q.chinese_prompt)+'</div></div>'+

    '<div class="zhen-input-area">'+
    '<label>✏️ 将上方紫色斜体的中文提示翻译成英文，填入空白处</label>'+
    '<textarea id="zhenInput" rows="3" placeholder="在此输入英文翻译..." autofocus></textarea></div>'+

    '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:0 8px">'+
    '<button class="btn btn-primary" onclick="submitZhenAnswer()" style="background:#2F5D50;border:none;border-radius:0;padding:10px 24px;font-family:Georgia,serif">提交批改</button>'+
    '<button class="btn btn-ghost" onclick="nextZhenQuestion()" style="font-size:0.82rem">跳过 →</button></div>'+
    '<div id="zhenResult"></div></div>';

  setTimeout(()=>{
    const inp=document.getElementById('zhenInput');
    if(inp){inp.focus();inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))submitZhenAnswer()})}
  },50);
}

async function submitZhenAnswer() {
  const inp=document.getElementById('zhenInput');
  if(!inp)return;
  const answer=inp.value.trim();
  if(!answer)return;
  const q=zhenState.questions[zhenState.currentIdx];
  const btn=document.querySelector('.btn-primary');
  if(btn){btn.textContent='⏳ 批改中...';btn.disabled=true}
  try{
    const r=await fetch(ZHEN_API+'/grade',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({questionId:q.id,userAnswer:answer,username:currentUser?currentUser.username:'anonymous',type:zhenState.mode})});
    const result=await r.json();
    if(result.error){alert(result.error);if(btn){btn.textContent='提交批改';btn.disabled=false}return}
    zhenState.answers[zhenState.currentIdx]={user_answer:answer,score:result.score,errors:result.errors,question_id:q.id};
    renderZhenResult(q,zhenState.answers[zhenState.currentIdx],result);
  }catch(e){alert('批改服务繁忙');if(btn){btn.textContent='提交批改';btn.disabled=false}}
}

function renderZhenResult(q, ans, result) {
  const res=result||ans;
  const errors=typeof res.errors==='string'?JSON.parse(res.errors):(res.errors||[]);
  const score=res.score||0;
  const pos=zhenState.currentIdx+1,total=zhenState.questions.length;
  const rect=document.getElementById('zhenGrid')?.getBoundingClientRect();

  const scoreColor=score>=2?'#2F5D50':(score>=1?'#C9A24B':'#B23A2F');
  const scoreLabel=score>=2?'✓ 满分！':(score>=1?'部分正确':'需订正');

  document.getElementById('zhenGrid').innerHTML='<div class="zhen-notebook">'+
    '<div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;padding:0 8px">'+
    '<span style="font-size:0.8rem;color:#888;font-family:Georgia,serif">📝 '+q.module+' · '+pos+'/'+total+'</span>'+
    '<button class="btn btn-ghost" onclick="renderZhenPage()" style="font-size:0.75rem">← 返回</button></div>'+

    '<div class="zhen-red-ink">'+
    '<div class="ink-header">✒️ 批改反馈</div>'+
    '<div class="ink-score" style="color:'+scoreColor+'">'+score+'/2 <span style="font-size:0.85rem;font-weight:400;color:#888">'+scoreLabel+'</span></div>'+
    (errors.length?'': '<div style="color:#2F5D50;font-size:0.85rem;margin-bottom:12px;font-style:italic">没有语法错误，翻译准确。</div>')+
    '<div style="margin-bottom:12px"><span style="font-size:0.82rem;color:#888">你的译文</span>'+
    '<div style="font-size:0.9rem;color:#2B2B2B;padding:8px 0;border-bottom:1px solid #f0d0d0">'+escapeHtml(ans.user_answer||'')+'</div></div>'+
    errors.map(e=>'<div class="ink-error" id="zhenError_'+pos+'">❌ '+e+'</div>').join('')+
    '<div class="ink-reference">📖 '+escapeHtml(q.reference_answer)+'</div>'+
    '<div class="ink-analysis">'+
    '<div style="font-weight:600;color:#2F5D50;margin-bottom:4px">📌 考点</div>'+
    '<div>'+q.grammar_point+'</div>'+
    (q.key_phrases?'<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'+
      (typeof q.key_phrases==='string'?JSON.parse(q.key_phrases):q.key_phrases).map(k=>'<span style="background:#f5f0ff;padding:2px 10px;border-radius:0;font-size:0.82rem;color:#7c3aed;border:1px solid #e0d0f0">'+k+'</span>').join('')+'</div>':'')+
    '</div></div>'+

    '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:0 8px">'+
    '<button class="btn btn-primary" onclick="nextZhenQuestion()" style="background:#2F5D50;border:none;border-radius:0;padding:10px 24px;font-family:Georgia,serif">'+(pos<total?'下一题 →':'查看结果')+'</button></div></div>';

  // 波浪线标注错误
  if(errors.length){
    setTimeout(()=>{
    },200);
  }
}

function nextZhenQuestion() {
  zhenState.currentIdx++;
  if(zhenState.currentIdx>=zhenState.questions.length){
    checkStreakMilestone();
  }
  renderZhenQuestion();
}

function checkStreakMilestone() {
  if(zhenState.mode!=='daily'||!currentUser)return;
  fetch(ZHEN_API+'/streak/'+encodeURIComponent(currentUser.username)).then(r=>r.json()).then(d=>{
    const s=d.current_streak||0;
    if(s>0&&s%7===0){
      const rect=document.getElementById('zhenGrid')?.getBoundingClientRect();
    }
  }).catch(()=>{});
}

function renderZhenComplete() {
  const total=zhenState.answers.length;
  const scored=zhenState.answers.filter(a=>a&&a.score!==undefined);
  const avg=scored.length?(scored.reduce((s,a)=>s+a.score,0)/scored.length).toFixed(1):0;
  const perfect=scored.filter(a=>a.score>=2).length;
  document.getElementById('zhenGrid').innerHTML='<div class="zhen-notebook">'+
    '<div style="text-align:center;padding:40px 20px"><div style="font-size:3rem;margin-bottom:10px">'+(avg>=1.5?'🎉':'💪')+'</div>'+
    '<h2 style="font-family:Georgia,serif;color:#2B2B2B;margin-bottom:6px">'+(zhenState.mode==='daily'?'今日打卡完成！':'练习完成！')+'</h2>'+
    '<p style="color:#888;font-size:0.9rem;margin-bottom:8px">完成 '+total+' 题 · 平均 '+avg+'/2 分 · 满分 '+perfect+' 题</p>'+
    '<button class="btn btn-primary" onclick="renderZhenPage()" style="background:#2F5D50;border:none;border-radius:0;margin-top:16px;padding:10px 32px;font-family:Georgia,serif">← 返回</button></div></div>';
}

function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
