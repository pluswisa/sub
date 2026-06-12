const BACKEND = "https://cf-subweb-subconverter.airport.kdns.fr";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(html(), {
        headers: {
          "content-type": "text/html;charset=utf-8"
        }
      });
    }

    if (url.pathname === "/api/convert") {
      return handleConvert(request);
    }

    return new Response("404 Not Found", { status: 404 });
  }
};

/* ================= API ================= */

async function handleConvert(request) {
  try {
    const body = await request.json();

    if (!body || !body.url || !body.target) {
      return new Response("Missing parameters", { status: 400 });
    }

    const api =
      `${BACKEND}/sub?target=${encodeURIComponent(body.target)}` +
      `&url=${encodeURIComponent(body.url)}`;

    const resp = await fetch(api, {
      headers: {
        "User-Agent": "SubConverter"
      }
    });

    const text = await resp.text();

    return new Response(text, {
      headers: {
        "content-type": "text/plain;charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: String(err)
    }), {
      status: 500,
      headers: {
        "content-type": "application/json"
      }
    });
  }
}

/* ================= UI ================= */

function html() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SubConverter</title>

<style>
* {
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:Inter, PingFang SC, Microsoft YaHei, sans-serif;
}

body {
  min-height:100vh;
  background:#0a0f1a;
  color:#fff;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:20px;
}

.card {
  width:100%;
  max-width:720px;
  height:1440px; /* PC卡片高度 */
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(56,189,248,0.35); /* 浅蓝光边框 */
  border-radius:24px;
  padding:36px;
  backdrop-filter:blur(40px);
  box-shadow:
    0 0 25px rgba(56,189,248,.18),
    0 0 60px rgba(56,189,248,.08),
    0 20px 60px rgba(0,0,0,.5);
  display:flex;
  flex-direction:column;
  align-items:center;
}

.title {
  font-size:36px;
  font-weight:800;
  background:linear-gradient(90deg,#fff,#7dd3fc);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  margin-bottom:16px;
}

.desc {
  margin-bottom:30px;
  color:#94a3b8;
  font-size:15px;
}

label {
  display:block;
  font-size:14px;
  margin-bottom:10px;
  color:#cbd5e1;
  align-self:flex-start;
}

.row {
  display:grid;
  grid-template-columns:1fr 200px;
  gap:14px;
  width:100%;
}

input, select, textarea {
  width:100%;
  padding:16px;
  border-radius:14px;
  border:1px solid rgba(120,180,255,0.15);
  background:rgba(255,255,255,0.04);
  color:#fff;
  outline:none;
  font-size:15px;
}

input:focus, select:focus, textarea:focus {
  border-color:#38bdf8; /* 浅蓝光 */
  box-shadow:
    0 0 0 3px rgba(56,189,248,.15),
    0 0 20px rgba(56,189,248,.18);
}

textarea {
  margin-top:20px;
  flex:1;
  resize:none;
  min-height:300px;
  font-size:15px;
  border:1px solid rgba(56,189,248,.25);
  box-shadow: inset 0 0 12px rgba(56,189,248,.08);
}

.btns {
  display:flex;
  gap:14px;
  margin-top:26px;
  width:100%;
}

button {
  flex:1;
  padding:16px;
  border:none;
  border-radius:14px;
  cursor:pointer;
  font-weight:700;
  font-size:15px;
  color:#fff;
  background:linear-gradient(135deg,#1e3a8a,#38bdf8);
  transition:.2s;
}

button:hover {
  opacity:0.9;
}

.footer {
  margin-top:26px;
  text-align:center;
  font-size:13px;
  color:#64748b;
  width:100%;
}

/* mobile */
@media(max-width:768px) {
  body {
    padding:12px;
    align-items:center;
  }

  .card {
    max-width:100%;
    height:720px; /* 安卓版高度 */
    padding:20px;
    border-radius:18px;
    box-shadow:
      0 0 18px rgba(56,189,248,.22),
      0 15px 45px rgba(0,0,0,.4);
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    overflow:hidden;
  }

  .title {
    font-size:26px;
  }

  .desc {
    font-size:13px;
    margin-bottom:18px;
  }

  .row {
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  input, select {
    padding:12px;
    font-size:14px;
  }

  .btns {
    flex-direction:column;
    gap:10px;
    margin-top:18px;
  }

  button {
    padding:12px;
    font-size:14px;
  }

  textarea {
    flex:1;
    min-height:180px;
    margin-top:12px;
    resize:none;
    border:1px solid rgba(56,189,248,.25);
    box-shadow: inset 0 0 12px rgba(56,189,248,.08);
  }

  .footer {
    margin-top:12px;
    font-size:12px;
  }
}
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
      <option value="clash">Clash Meta</option>
      <option value="singbox">Sing-box</option>
      <option value="surge">Surge</option>
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
async function convertSub() {
  const url = document.getElementById("url").value.trim();
  const target = document.getElementById("target").value;

  if(!url) {
    alert("请输入订阅链接");
    return;
  }

  const res = await fetch("/api/convert", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url, target })
  });

  const text = await res.text();
  document.getElementById("result").value = text;
}

function copyText() {
  navigator.clipboard.writeText(
    document.getElementById("result").value
  );
}

function downloadFile() {
  const blob = new Blob(
    [document.getElementById("result").value],
    { type: "text/yaml" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "config.yaml";
  a.click();
}
</script>

</body>
</html>`;
}

