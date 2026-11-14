const HTML = String.raw`<!DOCTYPE html>
<html lang="ur" dir="rtl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Agent AI</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:14px;min-height:100vh;background:radial-gradient(ellipse at top,#1a3156,#080d1c 70%);color:#fff;font-family:Arial,sans-serif}
.app{max-width:850px;margin:auto}
h1{text-align:center;background:linear-gradient(90deg,#65edff,#b18aff);-webkit-background-clip:text;background-clip:text;color:transparent}
.panel{background:rgba(25,42,69,.92);border:1px solid #344e73;border-radius:20px;padding:16px;margin:14px 0}
h2{text-align:center;font-size:19px}
button{border:0;border-radius:12px;padding:12px 15px;background:#187f9b;color:#fff;font:inherit;font-weight:bold;cursor:pointer;margin:3px}
button:active{transform:scale(.97)}
.row{display:flex;justify-content:center;flex-wrap:wrap;gap:8px}
select,textarea{width:100%;border:1px solid #476083;border-radius:12px;padding:12px;background:#101d31;color:#fff;font:inherit;margin:6px 0}
#agent{width:140px;height:140px;margin:15px auto;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:75px;background:radial-gradient(circle,#65eaff,#3452a0,#101827);border:3px solid #7ceeff}
#agent.speaking,#agent.listening{animation:p .5s infinite alternate}
@keyframes p{to{transform:scale(1.08)}}
.screen{position:relative;height:300px;background:#050a14;border-radius:15px;overflow:hidden}
#screenVideo{width:100%;height:100%;object-fit:contain}
#localVideo{position:absolute;width:100px;height:130px;right:10px;top:10px;object-fit:cover;border:2px solid #fff;border-radius:12px;background:#26364d}
.chat{height:300px;overflow-y:auto;background:#101a2c;border-radius:15px;padding:10px}
.msg{padding:10px;margin:8px 0;border-radius:12px;white-space:pre-wrap;line-height:1.7}
.user{background:#174f78;margin-left:10%}.agent{background:#2b3c57;margin-right:10%}
.status{text-align:center;color:#aeefff;padding:8px}
.log{background:#101a2c;padding:10px;border-radius:12px;min-height:80px;max-height:160px;overflow:auto;white-space:pre-wrap;color:#bcecff;font-size:13px}
.red{background:#a43d54}.purple{background:#7546a5}.green{background:#159b62}
</style></head><body><div class="app">
<h1>✨ My Agent AI</h1>
<div class="panel">
<div id="agent">🔮</div>
<div class="row">
<button onclick="setAgent('male')">👨 مرد</button>
<button onclick="setAgent('female')">👩 خاتون</button>
<button onclick="setAgent('orb')">🔮 Orb</button>
</div>
<h2>🌐 زبان</h2>
<select id="lang">
<option value="ur">اردو</option><option value="ps">پشتو</option><option value="en">English</option>
<option value="fa">فارسی</option><option value="ar">عربی</option><option value="hi">ہندی</option>
<option value="tr">ترکی</option><option value="zh">چینی</option><option value="fr">فرانسیسی</option><option value="de">جرمن</option>
</select>
</div>

<div class="panel"><h2>📹 ویڈیو کال اور اسکرین</h2>
<div class="screen"><video id="screenVideo" autoplay muted playsinline></video><video id="localVideo" autoplay muted playsinline></video></div>
<div class="status" id="callStatus">کیمرہ بند ہے</div>
<div class="row">
<button class="green" onclick="startCall()">📹 کال شروع</button>
<button onclick="toggleCam()">📷 کیمرہ</button>
<button class="purple" onclick="toggleMic()">🎙️ مائیک</button>
<button class="red" onclick="endCall()">📴 بند</button>
<button onclick="startScreen()">🖥️ اسکرین شیئر</button>
<button class="red" onclick="stopScreen()">اسکرین بند</button>
<button class="purple" onclick="lookNow()">👁️ معاون دیکھے</button>
</div></div>

<div class="panel"><h2>💬 گفتگو</h2>
<div class="chat" id="chat"><div class="msg agent">السلام علیکم! میں My Agent ہوں۔ آپ مجھ سے کسی بھی زبان میں بات کر سکتے ہیں۔</div></div>
<textarea id="msg" rows="2" placeholder="پیغام لکھیں..."></textarea>
<div class="row">
<button onclick="send()">بھیجیں</button>
<button class="purple" onclick="startVoice()">🎤 آواز</button>
<button class="red" onclick="stopSpeak()">🔇 بند</button>
</div>
<div class="status" id="status">تیار ہے</div></div>

<div class="panel"><h2>🔁 ترجمہ</h2>
<textarea id="tText" rows="3" placeholder="جو ترجمہ کرنا ہے لکھیں..."></textarea>
<div class="row">
<select id="tFrom" style="width:45%"></select>
<select id="tTo" style="width:45%"></select>
</div>
<div class="row"><button onclick="translateNow()">ترجمہ کریں</button><button class="purple" onclick="speakText($('tOut').textContent,$('tTo').value)">🔊 سنیں</button></div>
<div class="msg agent" id="tOut">ترجمہ یہاں آئے گا</div></div>

<div class="panel"><h2>⚙️ کام کا لاگ</h2><div class="log" id="log">تیار ہے۔</div></div>
</div>
<script>
var API=location.origin;
var $=function(i){return document.getElementById(i)};
var NAMES={ur:"اردو",ps:"پشتو",en:"English",fa:"فارسی",ar:"عربی",hi:"ہندی",tr:"ترکی",zh:"چینی",fr:"فرانسیسی",de:"جرمن"};
var LOCALE={ur:"ur-PK",ps:"ps-AF",en:"en-US",fa:"fa-IR",ar:"ar-SA",hi:"hi-IN",tr:"tr-TR",zh:"zh-CN",fr:"fr-FR",de:"de-DE"};
var agentVoice="male",history=[],sending=false,listening=false,recog=null;
var cam=null,scr=null,callActive=false,micOn=true;
for(var k in NAMES){
 $("tFrom").add(new Option(NAMES[k],k));
 $("tTo").add(new Option(NAMES[k],k));
}
$("tFrom").value="en";$("tTo").value="ur";

function log(t){var l=$("log");l.textContent+="\n["+new Date().toLocaleTimeString()+"] "+t;l.scrollTop=l.scrollHeight}
function add(t,c){var d=document.createElement("div");d.className="msg "+c;d.textContent=t;$("chat").appendChild(d);$("chat").scrollTop=$("chat").scrollHeight}
function setAgent(t){
 agentVoice=t==="female"?"female":"male";
 $("agent").textContent=t==="male"?"👨":t==="female"?"👩":"🔮";
}
async function post(path,body){
 var r=await fetch(API+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 var d=await r.json();
 if(!r.ok||d.success===false)throw new Error(d.error||("Server "+r.status));
 return d;
}

function pickVoice(code){
 if(!window.speechSynthesis)return null;
 var p=code.split("-")[0].toLowerCase();
 var m=speechSynthesis.getVoices().filter(function(v){return v.lang.toLowerCase().indexOf(p)===0});
 if(!m.length)return null;
 var re=agentVoice==="female"?/female|woman|zira|samantha|aria|jenny/i:/male|man|david|mark|daniel|guy/i;
 return m.find(function(v){return re.test(v.name)})||m[0];
}
function speakText(text,lang){
 if(!window.speechSynthesis||!text){return resume(800)}
 speechSynthesis.cancel();
 var s=new SpeechSynthesisUtterance(text);
 s.lang=LOCALE[lang]||"en-US";
 var v=pickVoice(s.lang);if(v)s.voice=v;
 s.pitch=agentVoice==="female"?1.18:.9;
 s.onstart=function(){$("agent").classList.add("speaking")};
 s.onend=s.onerror=function(){$("agent").classList.remove("speaking");resume(600)};
 speechSynthesis.speak(s);
}
function stopSpeak(){if(window.speechSynthesis)speechSynthesis.cancel();$("agent").classList.remove("speaking")}
function resume(d){if(callActive&&micOn)setTimeout(startVoice,d||600)}

async function send(){
 if(sending)return;
 var t=$("msg").value.trim();if(!t)return;
 add(t,"user");$("msg").value="";
 sending=true;$("status").textContent="جواب آ رہا ہے...";
 var failed=false;
 try{
  var d=await post("/chat",{message:t,language:$("lang").value,history:history.slice(-8),call:callActive});
  history.push({role:"user",content:t},{role:"assistant",content:d.reply});
  add(d.reply,"agent");log("جواب مل گیا");
  speakText(d.reply,$("lang").value);
 }catch(e){
  failed=true;add("معذرت! جواب نہیں مل سکا: "+e.message,"agent");log("خرابی: "+e.message);
 }
 sending=false;$("status").textContent="تیار ہے";
 if(failed)resume(1500);
}
$("msg").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});

function startVoice(){
 var S=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!S){$("status").textContent="اس براؤزر میں آواز کی پہچان نہیں";return}
 if(listening||sending)return;
 if(window.speechSynthesis&&speechSynthesis.speaking)return;
 recog=new S();recog.lang=LOCALE[$("lang").value]||"en-US";
 recog.continuous=false;recog.interimResults=false;
 recog.onstart=function(){listening=true;$("agent").classList.add("listening");$("status").textContent="سن رہا ہوں..."};
 recog.onresult=function(e){$("msg").value=e.results[0][0].transcript;send()};
 recog.onerror=function(e){
  $("status").textContent="مائیک مسئلہ: "+e.error;
  if(["not-allowed","service-not-allowed","language-not-supported"].indexOf(e.error)>=0)micOn=false;
 };
 recog.onend=function(){
  listening=false;$("agent").classList.remove("listening");
  if(callActive&&micOn&&!sending)setTimeout(startVoice,500);
 };
 try{recog.start()}catch(e){}
}

async function startCall(){
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$("callStatus").textContent="HTTPS اور جدید براؤزر چاہیے";return}
 try{
  cam=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});
  $("localVideo").srcObject=cam;
  callActive=true;micOn=true;
  $("callStatus").textContent="کال جاری ہے، بولیے...";
  log("کال شروع");startVoice();
 }catch(e){$("callStatus").textContent="اجازت نہیں ملی: "+e.message}
}
function toggleCam(){
 if(!cam)return;var t=cam.getVideoTracks()[0];t.enabled=!t.enabled;
 $("callStatus").textContent=t.enabled?"کیمرہ آن":"کیمرہ آف";
}
function toggleMic(){
 if(!callActive)return;micOn=!micOn;
 if(micOn)startVoice();else if(recog)try{recog.stop()}catch(e){}
 $("callStatus").textContent=micOn?"مائیک آن":"مائیک خاموش";
}
function endCall(){
 callActive=false;
 if(recog)try{recog.stop()}catch(e){}
 stopSpeak();
 if(cam){cam.getTracks().forEach(function(t){t.stop()});cam=null}
 $("localVideo").srcObject=null;$("callStatus").textContent="کال بند";log("کال بند");
}

async function startScreen(){
 if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia){$("callStatus").textContent="اسکرین شیئرنگ دستیاب نہیں";return}
 try{
  scr=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
  $("screenVideo").srcObject=scr;
  scr.getVideoTracks()[0].addEventListener("ended",stopScreen);
  $("callStatus").textContent="اسکرین شیئرنگ جاری";log("اسکرین شیئر شروع");
 }catch(e){$("callStatus").textContent="شروع نہیں ہوئی: "+e.message}
}
function stopScreen(){
 if(scr){scr.getTracks().forEach(function(t){t.stop()});scr=null}
 $("screenVideo").srcObject=null;$("callStatus").textContent="اسکرین بند";log("اسکرین بند");
}

async function lookNow(){
 var src=scr?$("screenVideo"):(cam?$("localVideo"):null);
 if(!src||!src.videoWidth){$("callStatus").textContent="پہلے کیمرہ یا اسکرین شروع کریں";return}
 var c=document.createElement("canvas");
 var w=640,h=Math.round(w*src.videoHeight/src.videoWidth);
 c.width=w;c.height=h;c.getContext("2d").drawImage(src,0,0,w,h);
 var img=c.toDataURL("image/jpeg",.7);
 $("status").textContent="تصویر دیکھ رہا ہوں...";log("تصویر بھیجی");
 try{
  var q=$("msg").value.trim()||"Describe what you see in detail.";
  var d=await post("/vision",{image:img,prompt:q,language:$("lang").value});
  add(d.reply,"agent");speakText(d.reply,$("lang").value);
 }catch(e){add("تصویر سمجھ نہیں سکا: "+e.message,"agent");log("خرابی: "+e.message)}
 $("status").textContent="تیار ہے";
}

async function translateNow(){
 var t=$("tText").value.trim();if(!t)return;
 $("tOut").textContent="ترجمہ ہو رہا ہے...";
 try{
  var d=await post("/translate",{text:t,from:$("tFrom").value,to:$("tTo").value});
  $("tOut").textContent=d.translated;log("ترجمہ مکمل");
 }catch(e){$("tOut").textContent="خرابی: "+e.message}
}
if(window.speechSynthesis)speechSynthesis.onvoiceschanged=function(){};
</script></body></html>`;

const LANGS = {
  ur: "Urdu", ps: "Pashto", en: "English", fa: "Persian (Farsi)", ar: "Arabic",
  hi: "Hindi", tr: "Turkish", zh: "Chinese", fr: "French", de: "German",
};

const SYSTEM = `You are "My Agent", a personal intelligent assistant.
- Reply in the user's chosen language, using that language's native script.
- Be short, clear and polite. Use short sentences because answers are spoken aloud.
- Before any external action (opening files, sending messages, deleting data) ask for explicit permission first.
- If something is impossible, say so honestly and give guidance.
- Never guess what you cannot clearly see. Ask the user instead.
- Do not lie. If you do not know, say "I don't know".
- Protect the user's privacy and passwords. Refuse harmful or illegal requests.`;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
      });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const path = new URL(request.url).pathname;

    if (request.method === "GET") {
      return new Response(HTML, {
        headers: { ...cors, "Content-Type": "text/html; charset=UTF-8" },
      });
    }

    if (request.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

    let body;
    try { body = await request.json(); }
    catch { return json({ success: false, error: "Invalid JSON" }, 400); }

    if (!env.AI) {
      return json({ success: false, error: "Workers AI binding (AI) نہیں لگی" }, 500);
    }

    try {
      // ترجمہ
      if (path === "/translate") {
        const { text, from, to } = body;
        if (!text || !LANGS[from] || !LANGS[to]) {
          return json({ success: false, error: "غلط زبان یا خالی متن" }, 400);
        }
        const r = await env.AI.run("@cf/meta/m2m100-1.2b", {
          text, source_lang: from, target_lang: to,
        });
        return json({ success: true, translated: r.translated_text });
      }

      // تصویر دیکھنا (کیمرہ / اسکرین کا ایک فریم)
      if (path === "/vision") {
        const { image, prompt, language } = body;
        if (!image) return json({ success: false, error: "تصویر نہیں ملی" }, 400);
        const b64 = image.split(",")[1];
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const r = await env.AI.run("@cf/llava-hf/llava-1.5-7b-hf", {
          image: [...bytes],
          prompt: prompt || "Describe what you see.",
          max_tokens: 300,
        });
        let reply = r.description || r.response || "";
        if (language && language !== "en" && LANGS[language] && reply) {
          const t = await env.AI.run("@cf/meta/m2m100-1.2b", {
            text: reply, source_lang: "en", target_lang: language,
          });
          reply = t.translated_text || reply;
        }
        return json({ success: true, reply });
      }

      // چیٹ (مرکزی راستہ)
      const { message, language, history, call } = body;
      if (!message) return json({ success: false, error: "پیغام خالی ہے" }, 400);
      const langName = LANGS[language] || "English";
      const system = SYSTEM +
        "\nAnswer ONLY in " + langName + "." +
        (call ? "\nThis is a live voice call. Keep answers to 1-3 sentences." : "");
      const messages = [
        { role: "system", content: system },
        ...(Array.isArray(history) ? history.slice(-8) : []),
        { role: "user", content: message },
      ];
      const r = await env.AI.run("@cf/qwen/qwen3.8-27b", { messages, max_tokens: 400 });
      const reply =
        r.response ||
        r.result ||
        (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) ||
        "";
      if (!reply) return json({ success: false, error: "ماڈل نے خالی جواب دیا" }, 500);
      return json({ success: true, reply });
    } catch (e) {
      return json({ success: false, error: String(e.message || e) }, 500);
    }
  },
};
