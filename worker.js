addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const BACKEND = "https://cf-subweb-subconverter.airport.kdns.fr"; // 替换为你的 Subconverter 后端地址

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // 代理 /sub 请求到后端
  if (pathname === '/sub') {
    const target = url.searchParams.get('target')
    const subUrl = url.searchParams.get('url')

    if (!target || !subUrl) {
      return new Response('Missing target or url', { status: 400 })
    }

    try {
      const res = await fetch(BACKEND + '/sub?target=' + encodeURIComponent(target) + '&url=' + encodeURIComponent(subUrl))
      const text = await res.text()
      return new Response(text, {
        status: res.status,
        headers: { 'Content-Type': res.headers.get('Content-Type') || 'text/plain;charset=utf-8' }
      })
    } catch (err) {
      return new Response(`转换失败: ${err}`, { status: 500 })
    }
  }

  // 返回前端网页
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SubConverter Web</title>
<style>
* {margin:0;padding:0;box-sizing:border-box;font-family:Inter,PingFang SC,Microsoft YaHei,sans-serif;}
body{min-height:100vh;background:#0a0f1a;color:#fff;display:flex;justify-content:center;align-items:center;padding:20px;}
.card{width:100%;max-width:720px;height:1440px;background:rgba(255,255,255,0.04);border:1px solid rgba(56,189,248,0.35);border-radius:24px;padding:36px;backdrop-filter:blur(40px);box-shadow:0 0 25px rgba(56,189,248,.18),0 0 60px rgba(56,189,248,.08),0 20px 60px rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;}
.title{font-size:36px;font-weight:800;background:linear-gradient(90deg,#fff,#7dd3fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;}
.desc{margin-bottom:30px;color:#94a3b8;font-size:15px;}
label{display:block;font-size:14px;margin-bottom:10px;color:#cbd5e1;align-self:flex-start;}
.row{display:grid;grid-template-columns:1fr 200px;gap:14px;width:100%;}
input,select,textarea{width:100%;padding:16px;border-radius:14px;border:1px solid rgba(120,180,255,0.15);background:rgba(255,255,255,0.04);color:#fff;outline:none;font-size:15px;}
input:focus,select:focus,textarea:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.15),0 0 20px rgba(56,189,248,.18);}
textarea{margin-top:20px;flex:1;resize:none;min-height:300px;font-size:15px;border:1px solid rgba(56,189,248,.25);box-shadow:inset 0 0 12px rgba(56,189,248,.08);}
.btns{display:flex;gap:14px;margin-top:26px;width:100%;}
button{flex:1;padding:16px;border:none;border-radius:14px;cursor:pointer;font-weight:700;font-size:15px;color:#fff;background:linear-gradient(135deg,#1e3a8a,#38bdf8);transition:.2s;}
button:hover{opacity:0.9;}
.footer{margin-top:26px;text-align:center;font-size:13px;color:#64748b;width:100%;}
@media(max-width:768px){body{padding:12px;align-items:center;}.card{max-width:100%;height:720px;padding:20px;border-radius:18px;}.title{font-size:26px;}.desc{font-size:13px;margin-bottom:18px;}.row{display:flex;flex-direction:column;gap:10px;}.btns{flex-direction:column;gap:10px;margin-top:18px;}.footer{margin-top:12px;font-size:12px;}}
</style>
</head>
<body>
<div class="card">
  <div class="title">SubConverter</div>
  <div class="desc">Subscription Conversion Tool</div>
  <label>订阅链接</label>
  <div class="row">
    <input id="url" placeholder="https://example.com/sub">
    <select id="target">
      <option value="clash">Clash</option>
      <option value="clashr">ClashR</option>
      <option value="clashmeta">Clash Meta</option>
      <option value="singbox">Sing-box</option>
      <option value="surge">Surge</option>
      <option value="quantumult">Quantumult</option>
      <option value="quantumultx">Quantumult X</option>
      <option value="loon">Loon</option>
      <option value="surfboard">Surfboard</option>
      <option value="mellow">Mellow</option>
      <option value="sstap">SSTap</option>
      <option value="kitsunebi">Kitsunebi</option>
      <option value="ss">Shadowsocks</option>
      <option value="ssr">ShadowsocksR</option>
      <option value="trojan">Trojan</option>
      <option value="v2ray">V2Ray</option>
    </select>
  </div>
  <div class="btns">
    <button onclick="convertSub()">转换</button>
    <button onclick="copyText()">复制</button>
    <button onclick="downloadFile()">下载</button>
  </div>
  <textarea id="result"></textarea>
  <div class="footer">Powered by SubConverter</div>
</div>

<script>
async function convertSub(){
  const url=document.getElementById('url').value.trim().replace(/\\s+/g,'');
  const target=document.getElementById('target').value;
  const result=document.getElementById('result');
  if(!url){alert('请输入订阅或节点链接');return;}
  const api='/sub?target='+encodeURIComponent(target)+'&url='+encodeURIComponent(url);
  result.value='Converting...';
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),60000);
    const res=await fetch(api,{method:'GET',signal:controller.signal,headers:{Accept:'*/*'}});
    clearTimeout(timeout);
    const text=await res.text();
    if(!res.ok){result.value='HTTP '+res.status+'\\n\\n'+(text||'后端未返回错误内容');return;}
    if(!text||text.trim()===''){result.value='转换完成，但返回内容为空\\n可能原因：\\n1. 订阅链接或节点链接无效\\n2. 订阅内容为空或不支持该协议\\n3. 节点数量过多导致解析超时\\n4. 后端配置异常';return;}
    result.value=text;
  }catch(err){
    if(err.name==='AbortError'){result.value='转换超时（60秒）\\n请检查：\\n1. 订阅或节点链接是否有效\\n2. OpenWrt宿主机是否能访问节点\\n3. 节点数量过多\\n4. 后端日志是否报错';return;}
    result.value='请求失败\\n\\n'+err;
  }
}

async function copyText(){
  const text=document.getElementById('result').value;
  if(!text){alert('没有可复制内容');return;}
  try{await navigator.clipboard.writeText(text);alert('复制成功');}catch(e){alert('复制失败');}
}

function downloadFile(){
  const text=document.getElementById('result').value;
  if(!text){alert('没有可下载内容');return;}
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=document.getElementById('target').value==='clash'?'config.yaml':'subscription.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
}
</script>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=utf-8' } })
}
