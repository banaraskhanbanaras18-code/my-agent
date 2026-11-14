<!DOCTYPE html>
<html lang="ur">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#080d1c">
<title>My Agent AI</title>

<style>
*{box-sizing:border-box}
body{margin:0;padding:14px;min-height:100vh;background:radial-gradient(ellipse at top,#1a3156,#080d1c 70%);color:white;font-family:Arial,sans-serif}
.app{max-width:850px;margin:auto}
header{text-align:center;padding:12px}
header h1{font-size:32px;margin:5px;background:linear-gradient(90deg,#65edff,#b18aff);color:transparent;background-clip:text;-webkit-background-clip:text}
header p{color:#b5c8e5}
.panel{background:rgba(25,42,69,.92);border:1px solid #344e73;border-radius:20px;padding:16px;margin:14px 0;box-shadow:0 10px 30px #0005}
h2{text-align:center;font-size:19px}
button,select,textarea{font:inherit}
button{border:0;border-radius:12px;padding:12px 15px;background:#187f9b;color:white;font-weight:bold;cursor:pointer}
button:disabled{opacity:.5}
button:active{transform:scale(.97)}
.avatar-buttons,.voice-settings,.call-controls,.row{display:flex;justify-content:center;flex-wrap:wrap;gap:9px}
.avatar-buttons button{background:#263e63}
.avatar-buttons button.active{background:#087f9a;border:1px solid #6aeaff}
#agent-display{width:160px;height:160px;margin:25px auto 15px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:90px;background:radial-gradient(circle,#65eaff,#3452a0,#101827);border:3px solid #7ceeff;box-shadow:0 0 35px #45dfff88;position:relative;transition:.3s}
#agent-display.female{background:radial-gradient(circle,#ff9be5,#813b88,#21132c);border-color:#ff9be5}
#agent-display.male{background:radial-gradient(circle,#65d9ff,#31558d,#101827)}
#agent-display.speaking{animation:speak .4s infinite alternate}
#agent-display.listening{animation:listen .8s infinite alternate}
@keyframes speak{to{transform:scale(1.09);box-shadow:0 0 60px #45dfff}}
@keyframes listen{to{transform:scale(1.08);box-shadow:0 0 60px #45dfff}}
#agent-message,.status{text-align:center;color:#aeefff;padding:10px}
select,textarea{width:100%;border:1px solid #476083;border-radius:12px;padding:13px;background:#101d31;color:white;margin:7px 0}
select option{background:#101d31}
.chat{height:320px;overflow-y:auto;background:#101a2c;border:1px solid #344b6b;border-radius:15px;padding:12px}
.msg{padding:12px;margin:9px 0;border-radius:13px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7}
.user{background:#174f78;margin-left:10%;text-align:right}
.agent{background:#2b3c57;margin-right:10%}
.controls{display:flex;gap:8px;margin-top:10px}
.controls textarea{min-height:55px;resize:vertical;flex:1;margin:0}
.send{min-width:78px}
.voice,.stop{width:100%;margin-top:9px}
.voice{background:#7546a5}
.stop{background:#a43d54}
.look{background:#7546a5;width:100%;margin-top:9px}
.call-panel{background:#101d31;border:2px solid #476083;border-radius:18px;padding:13px;margin:12px 0;text-align:center}
.call-screen{position:relative;width:100%;height:350px;background:#050a14;border-radius:15px;overflow:hidden;display:flex;align-items:center;justify-content:center}
#remoteVideo{width:100%;height:100%;object-fit:cover;background:#050a14}
#localVideo{position:absolute;width:110px;height:145px;right:10px;top:10px;object-fit:cover;border:2px solid white;border-radius:12px;background:#26364d}
#videoPlaceholder{position:absolute;text-align:center;color:#aeefff;padding:15px;pointer-events:none}
.call-controls button{width:58px;height:58px;border-radius:50%;font-size:22px;padding:8px}
.call-start{background:#159b62}
.call-end{background:#d83248}
.call-camera{background:#315b91}
.call-mic{background:#6546a5}
.screen-box{background:#081321;border:1px solid #476083;border-radius:15px;padding:12px;text-align:center}
#screenVideo{width:100%;max-height:350px;background:#03070e;border-radius:12px;display:none}
.work-log{text-align:left;background:#101a2c;padding:12px;border-radius:12px;min-height:90px;max-height:200px;overflow:auto;color:#bcecff;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7}
.footer{text-align:center;color:#7188a9;font-size:12px;padding:18px}
@media(max-width:480px){
 .call-screen{height:270px}
 #localVideo{width:85px;height:115px}
 #agent-display{width:135px;height:135px;font-size:75px}
 header h1{font-size:27px}
}
</style>
</head>

<body>
<div class="app">

<header>
<h1>✨ My Agent AI</h1>
<p>آپ کا ذاتی ذہین معاون</p>
</header>

<section class="panel">
<h2>اپنا AI معاون منتخب کریں</h2>
<div class="avatar-buttons">
<button id="maleBtn" onclick="selectAgent('male')">👨 مرد معاون</button>
<button id="femaleBtn" onclick="selectAgent('female')">👩 خاتون معاون</button>
<button id="orbBtn" onclick="selectAgent('orb')">🔮 AI Orb</button>
</div>
<div id="agent-display">🔮</div>
<p id="agent-message">آپ کا معاون حاضر ہے</p>
<h2>معاون کی آواز</h2>
<div class="voice-settings">
<button onclick="setAgentVoice('male')">👨 مردانہ آواز</button>
<button onclick="setAgentVoice('female')">👩 زنانہ آواز</button>
</div>
</section>

<section class="panel">
<h2>📹 لائیو ویڈیو کال</h2>
<div class="call-panel">
<div class="call-screen">
<video id="remoteVideo" autoplay playsinline></video>
<div id="videoPlaceholder">
<div style="font-size:65px">🤖</div>
<strong>My Agent AI</strong>
<p>کال شروع کریں اور بولیں۔ معاون آواز میں جواب دے گا۔</p>
</div>
<video id="localVideo" autoplay muted playsinline></video>
</div>
<p class="call-status" id="callStatus">ویڈیو کال شروع کرنے کے لیے 📹 دبائیں</p>
<div class="call-controls">
<button class="call-start" onclick="startVideoCall()" title="کال شروع">📹</button>
<button class="call-camera" onclick="toggleCamera()" title="کیمرہ">📷</button>
<button class="call-mic" onclick="toggleMicrophone()" title="مائیک">🎙️</button>
<button class="call-end" onclick="endVideoCall()" title="کال بند">📴</button>
</div>
<button class="look" onclick="lookNow()">👁️ معاون کیمرہ / اسکرین دیکھے</button>
</div>
</section>

<section class="panel">
<h2>🖥️ لائیو اسکرین شیئرنگ</h2>
<div class="screen-box">
<p>اپنی اسکرین شیئر کریں تاکہ معاون کو کام دکھایا جا سکے۔</p>
<video id="screenVideo" autoplay muted playsinline></video>
<p id="screenStatus" class="status">اسکرین شیئرنگ بند ہے</p>
<button onclick="startScreenShare()">🖥️ اسکرین دکھائیں</button>
<button class="stop" onclick="stopScreenShare()">اسکرین شیئرنگ بند کریں</button>
</div>
</section>

<section class="panel">
<h2>🌐 زبان منتخب کریں</h2>
<select id="language">
<option value="ur">اردو</option>
<option value="ps">پشتو</option>
<option value="en">English</option>
<option value="fa">فارسی</option>
<option value="ar">عربی</option>
<option value="hi">ہندی</option>
<option value="tr">ترکی</option>
<option value="zh">چینی</option>
<option value="fr">فرانسیسی</option>
<option value="de">جرمن</option>
</select>

<h2>💬 AI کے ساتھ گفتگو</h2>
<div class="chat" id="chat">
<div class="msg agent">السلام علیکم! میں My Agent ہوں۔
آپ مجھ سے اردو، پشتو، انگریزی اور دوسری زبانوں میں بات کر سکتے ہیں۔</div>
</div>

<div class="controls">
<textarea id="message" placeholder="اپنا پیغام لکھیں..."></textarea>
<button class="send" id="sendBtn" onclick="sendMessage()">بھیجیں</button>
</div>

<button class="voice" onclick="startVoice()">🎤 آواز سے بات کریں</button>
<button class="stop" onclick="stopSpeaking()">🔇 آواز بند کریں</button>
<div class="status" id="status">My Agent تیار ہے</div>
</section>

<section class="panel">
<h2>🔁 ترجمہ</h2>
<textarea id="tText" rows="3" placeholder="جو ترجمہ کرنا ہے یہاں لکھیں..."></textarea>
<div class="row">
<select id="tFrom" style="width:45%"></select>
<select id="tTo" style="width:45%"></select>
</div>
<div class="row" style="margin-top:8px">
<button onclick="translateNow()">ترجمہ کریں</button>
<button class="voice" style="width:auto;margin:0" onclick="speakText(document.getElementById('tOut').textContent,document.getElementById('tTo').value)">🔊 سنیں</button>
</div>
<div class="msg agent" id="tOut">ترجمہ یہاں آئے گا</div>
</section>

<section class="panel">
<h2>⚙️ کام کرنے کا پینل</h2>
<p>یہاں معاون کی جانب سے موصول ہونے والے جوابات اور کام کی تفصیل نظر آئے گی۔</p>
<div class="work-log" id="workLog">My Agent تیار ہے۔
ابھی کوئی خودکار کمپیوٹر کارروائی منسلک نہیں ہے۔</div>
</section>

<div class="footer">My Agent AI • Personal Intelligent Assistant</div>

</div>

<script>
// آپ کا Cloudflare Worker
const API="https://myagentcore.banaraskhanbanaras18.workers.dev";

const NAMES={ur:"اردو",ps:"پشتو",en:"English",fa:"فارسی",ar:"عربی",hi:"ہندی",tr:"ترکی",zh:"چینی",fr:"فرانسیسی",de:"جرمن"};
const LOCALE={ur:"ur-PK",ps:"ps-AF",en:"en-US",fa:"fa-IR",ar:"ar-SA",hi:"hi-IN",tr:"tr-TR",zh:"zh-CN",fr:"fr-FR",de:"de-DE"};

const chat=document.getElementById("chat");
const input=document.getElementById("message");
const status=document.getElementById("status");
const language=document.getElementById("language");
const display=document.getElementById("agent-display");
const workLog=document.getElementById("workLog");
let agentType="orb";
let agentVoice="male";
let recognition=null;
let isListening=false;
let isSending=false;
let localStream=null;
let screenStream=null;
let callActive=false;
let callMicOn=true;
let history=[];

// ترجمہ کی زبانوں کی فہرست بھرنا
for(const k in NAMES){
 document.getElementById("tFrom").add(new Option(NAMES[k],k));
 document.getElementById("tTo").add(new Option(NAMES[k],k));
}
document.getElementById("tFrom").value="en";
document.getElementById("tTo").value="ur";

function logWork(text){
 const time=new Date().toLocaleTimeString();
 workLog.textContent+="\n["+time+"] "+text;
 workLog.scrollTop=workLog.scrollHeight;
}
function resumeListening(delay){
 if(callActive&&callMicOn){
  setTimeout(startVoice,delay||600);
 }
}
async function post(path,body){
 const r=await fetch(API+path,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify(body)
 });
 let d;
 try{d=await r.json();}catch(e){throw new Error("Server error: "+r.status);}
 if(!r.ok||d.success===false)throw new Error(d.error||("Server error: "+r.status));
 return d;
}
function selectAgent(type){
 agentType=type;
 display.className=type;
 display.textContent=type==="male"?"👨":type==="female"?"👩":"🔮";
 document.getElementById("agent-message").textContent=
 type==="male"?"مرد معاون منتخب ہوگیا":
 type==="female"?"خاتون معاون منتخب ہوگئی":
 "AI Orb منتخب ہوگیا";
 ["maleBtn","femaleBtn","orbBtn"].forEach(id=>{
  document.getElementById(id).classList.remove("active");
 });
 document.getElementById(
  type==="male"?"maleBtn":
  type==="female"?"femaleBtn":"orbBtn"
 ).classList.add("active");
 if(type==="male")agentVoice="male";
 if(type==="female")agentVoice="female";
}
function setAgentVoice(type){
 agentVoice=type;
 document.getElementById("agent-message").textContent=
 type==="male"?"مردانہ آواز منتخب ہوگئی":"زنانہ آواز منتخب ہوگئی";
 status.textContent="آواز کا انتخاب ہوگیا";
}
function addMessage(text,type){
 const div=document.createElement("div");
 div.className="msg "+type;
 div.textContent=text;
 chat.appendChild(div);
 chat.scrollTop=chat.scrollHeight;
}
function getVoices(){
 return window.speechSynthesis?window.speechSynthesis.getVoices():[];
}
function chooseVoice(localeCode){
 const prefix=localeCode.split("-")[0].toLowerCase();
 const matching=getVoices().filter(v=>v.lang.toLowerCase().startsWith(prefix));
 if(!matching.length)return null;
 const patterns=agentVoice==="female"?
 /female|woman|zira|samantha|susan|karen|aria|jenny/i:
 /male|man|david|mark|daniel|james|guy/i;
 return matching.find(v=>patterns.test(v.name))||matching[0];
}
function speakText(text,langCode){
 if(!window.speechSynthesis){
  status.textContent="اس براؤزر میں آواز دستیاب نہیں";
  resumeListening(800);
  return;
 }
 if(!text){resumeListening(800);return;}
 window.speechSynthesis.cancel();
 const speech=new SpeechSynthesisUtterance(text);
 const locale=LOCALE[langCode]||"en-US";
 speech.lang=locale;
 const voice=chooseVoice(locale);
 if(voice)speech.voice=voice;
 else logWork("اس زبان کی آواز فون میں نہیں ملی، ڈیفالٹ آواز استعمال ہوگی");
 speech.rate=agentVoice==="female"?.96:1;
 speech.pitch=agentVoice==="female"?1.18:.88;
 speech.volume=1;
 speech.onstart=()=>{
  display.classList.add("speaking");
  status.textContent="معاون بول رہا ہے...";
 };
 speech.onend=()=>{
  display.classList.remove("speaking");
  status.textContent="My Agent تیار ہے";
  resumeListening(600);
 };
 speech.onerror=()=>{
  display.classList.remove("speaking");
  status.textContent="آواز چلانے میں مسئلہ ہے";
  resumeListening(800);
 };
 window.speechSynthesis.speak(speech);
}
function speakAnswer(text){speakText(text,language.value);}
function stopSpeaking(){
 if(window.speechSynthesis)window.speechSynthesis.cancel();
 display.classList.remove("speaking");
 status.textContent="آواز بند کردی گئی";
}

async function sendMessage(){
 if(isSending)return;
 const message=input.value.trim();
 if(!message)return;
 addMessage(message,"user");
 input.value="";
 isSending=true;
 document.getElementById("sendBtn").disabled=true;
 status.textContent="جواب حاصل کیا جا رہا ہے...";
 let failed=false;
 try{
  const data=await post("/chat",{
   message:message,
   language:language.value,
   history:history.slice(-8),
   call:callActive
  });
  const answer=data.reply;
  if(!answer)throw new Error("AI کا جواب خالی موصول ہوا");
  history.push({role:"user",content:message},{role:"assistant",content:answer});
  addMessage(answer,"agent");
  logWork("AI نے جواب دیا: "+answer);
  speakAnswer(answer);
 }catch(error){
  failed=true;
  status.textContent="کنکشن یا سرور کا مسئلہ: "+error.message;
  addMessage("معذرت! سرور سے جواب حاصل نہیں ہوسکا۔ دوبارہ کوشش کریں۔","agent");
  logWork("خرابی: "+error.message);
 }finally{
  isSending=false;
  document.getElementById("sendBtn").disabled=false;
  if(failed)resumeListening(1200);
 }
}

function startVoice(){
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){
  status.textContent="اس براؤزر میں Voice Recognition دستیاب نہیں";
  return;
 }
 if(isListening||isSending)return;
 if(window.speechSynthesis&&window.speechSynthesis.speaking)return;
 recognition=new Speech();
 recognition.lang=LOCALE[language.value]||"en-US";
 recognition.continuous=false;
 recognition.interimResults=false;
 recognition.maxAlternatives=1;
 recognition.onstart=()=>{
  isListening=true;
  display.classList.add("listening");
  status.textContent="آپ کی بات سن رہا ہوں...";
 };
 recognition.onresult=(event)=>{
  input.value=event.results[0][0].transcript;
  status.textContent="آپ کی بات سمجھ آگئی";
  sendMessage();
 };
 recognition.onerror=(event)=>{
  status.textContent="مائیکروفون مسئلہ: "+event.error;
  if(["not-allowed","service-not-allowed","language-not-supported"].includes(event.error)){
   callMicOn=false;
   logWork("سننا بند: "+event.error);
  }
 };
 recognition.onend=()=>{
  isListening=false;
  display.classList.remove("listening");
  if(callActive&&callMicOn&&!isSending){
   setTimeout(startVoice,500);
  }
 };
 try{recognition.start();}
 catch(error){status.textContent="مائیکروفون شروع نہیں ہوا";}
}

async function startVideoCall(){
 if(callActive&&localStream)return;
 if(!navigator.mediaDevices?.getUserMedia){
  document.getElementById("callStatus").textContent="کیمرہ کے لیے HTTPS اور معاون براؤزر ضروری ہے";
  return;
 }
 try{
  localStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});
  const video=document.getElementById("localVideo");
  video.srcObject=localStream;
  await video.play();
  document.getElementById("callStatus").textContent="کال شروع ہے، بولیے...";
  status.textContent="کال میں گفتگو جاری ہے";
  logWork("ویڈیو کال شروع ہوگئی");
  callActive=true;
  callMicOn=true;
  startVoice();
 }catch(error){
  document.getElementById("callStatus").textContent="کیمرہ کی اجازت نہیں ملی: "+error.message;
 }
}
function toggleCamera(){
 if(!localStream){status.textContent="پہلے کیمرہ شروع کریں";return;}
 const track=localStream.getVideoTracks()[0];
 if(track){
  track.enabled=!track.enabled;
  status.textContent=track.enabled?"کیمرہ آن":"کیمرہ آف";
 }
}
function toggleMicrophone(){
 if(!callActive){status.textContent="پہلے کال شروع کریں";return;}
 callMicOn=!callMicOn;
 if(callMicOn){startVoice();}
 else if(recognition){try{recognition.stop();}catch(e){}}
 status.textContent=callMicOn?"مائیک آن":"مائیک خاموش";
}
function endVideoCall(){
 callActive=false;
 if(recognition){try{recognition.stop();}catch(e){}}
 stopSpeaking();
 if(localStream){
  localStream.getTracks().forEach(track=>track.stop());
  localStream=null;
 }
 document.getElementById("localVideo").srcObject=null;
 document.getElementById("callStatus").textContent="ویڈیو کال بند ہوگئی";
 status.textContent="کیمرہ اور مائیک بند ہوگئے";
 logWork("کیمرہ بند ہوگیا");
}

async function startScreenShare(){
 if(!navigator.mediaDevices?.getDisplayMedia){
  document.getElementById("screenStatus").textContent="اس براؤزر یا موبائل میں اسکرین شیئرنگ دستیاب نہیں";
  return;
 }
 try{
  screenStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
  const video=document.getElementById("screenVideo");
  video.srcObject=screenStream;
  video.style.display="block";
  await video.play();
  document.getElementById("screenStatus").textContent="اسکرین شیئرنگ چل رہی ہے";
  screenStream.getVideoTracks()[0].addEventListener("ended",stopScreenShare);
  logWork("اسکرین شیئرنگ شروع ہوگئی");
 }catch(error){
  document.getElementById("screenStatus").textContent="اسکرین شیئرنگ شروع نہیں ہوئی: "+error.message;
 }
}
function stopScreenShare(){
 if(screenStream){
  screenStream.getTracks().forEach(track=>track.stop());
  screenStream=null;
 }
 const video=document.getElementById("screenVideo");
 video.srcObject=null;
 video.style.display="none";
 document.getElementById("screenStatus").textContent="اسکرین شیئرنگ بند ہے";
 logWork("اسکرین شیئرنگ بند ہوگئی");
}

// معاون کیمرے یا اسکرین کا ایک فریم دیکھے
async function lookNow(){
 const src=screenStream?document.getElementById("screenVideo"):
  (localStream?document.getElementById("localVideo"):null);
 if(!src||!src.videoWidth){
  status.textContent="پہلے کیمرہ یا اسکرین شیئرنگ شروع کریں";
  return;
 }
 const c=document.createElement("canvas");
 const w=640;
 const h=Math.round(w*src.videoHeight/src.videoWidth);
 c.width=w;c.height=h;
 c.getContext("2d").drawImage(src,0,0,w,h);
 const img=c.toDataURL("image/jpeg",.7);
 status.textContent="تصویر دیکھ رہا ہوں...";
 logWork("تصویر معاون کو بھیجی");
 try{
  const q=input.value.trim()||"Describe what you see in detail.";
  const d=await post("/vision",{image:img,prompt:q,language:language.value});
  addMessage(d.reply,"agent");
  logWork("معاون نے تصویر دیکھ لی");
  speakAnswer(d.reply);
 }catch(error){
  addMessage("تصویر سمجھ نہیں سکا: "+error.message,"agent");
  logWork("خرابی: "+error.message);
 }
 status.textContent="My Agent تیار ہے";
}

// ترجمہ
async function translateNow(){
 const text=document.getElementById("tText").value.trim();
 if(!text)return;
 const out=document.getElementById("tOut");
 out.textContent="ترجمہ ہو رہا ہے...";
 try{
  const d=await post("/translate",{
   text:text,
   from:document.getElementById("tFrom").value,
   to:document.getElementById("tTo").value
  });
  out.textContent=d.translated;
  logWork("ترجمہ مکمل ہوگیا");
 }catch(error){
  out.textContent="خرابی: "+error.message;
  logWork("ترجمے میں خرابی: "+error.message);
 }
}

input.addEventListener("keydown",event=>{
 if(event.key==="Enter"&&!event.shiftKey){
  event.preventDefault();
  sendMessage();
 }
});
if(window.speechSynthesis){
 window.speechSynthesis.onvoiceschanged=()=>getVoices();
 getVoices();
}
selectAgent("orb");
</script>

</body>
</html>
