export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 1. جب مائیک سے آواز یا ٹیکسٹ میسج آئے (POST ریکویسٹ)
    if (request.method === "POST") {
      try {
        const data = await request.json();
        const userMessage = data.message || "";

        if (!env.AI) {
          return new Response(JSON.stringify({ reply: "منارس خان صاحب، آپ کے کلاؤڈ فلیر میں AI بائنڈنگ کنیکٹ نہیں ہے۔" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // AI ماڈل سے جواب لینا
        const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [{ role: "user", content: userMessage }],
        });

        return new Response(JSON.stringify({ reply: aiResponse.response }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ reply: "کوڈ میں خرابی آئی ہے: " + error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 2. خوبصورت وائس اور ٹیکسٹ چیٹ اسکرین (GET ریکویسٹ)
    const html = `
      <!DOCTYPE html>
      <html lang="ur">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>منارس خان کا AI وائس ایجنٹ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; direction: rtl; }
          .chat-container { background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 20px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); text-align: center; width: 90%; max-width: 400px; }
          h1 { margin-bottom: 10px; font-size: 24px; }
          .status-text { color: #e2e8f0; font-size: 14px; margin-bottom: 20px; }
          .mic-btn { background: #ff4757; border: none; border-radius: 50%; width: 90px; height: 90px; color: white; font-size: 32px; cursor: pointer; box-shadow: 0 0 20px rgba(255, 71, 87, 0.5); transition: transform 0.2s, background 0.2s; margin: 20px 0; }
          .mic-btn:active { transform: scale(0.9); background: #ff6b81; }
          .mic-btn.listening { background: #2ed573; box-shadow: 0 0 25px rgba(46, 213, 115, 0.8); animation: pulse 1.5s infinite; }
          .output-box { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 15px; min-height: 80px; margin-top: 20px; font-size: 16px; text-align: right; white-space: pre-wrap; max-height: 150px; overflow-y: auto; }
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        </style>
      </head>
      <body>

        <div class="chat-container">
          <h1>منارس خان کا AI وائس سسٹم 🎙️</h1>
          <p class="status-text">بٹن دبا کر بولیں، سسٹم آپ کی آواز سن کر جواب دے گا</p>
          
          <button id="micButton" class="mic-btn">🎙️</button>
          
          <div style="font-weight: bold; margin-top: 10px;" id="listeningStatus">بٹن دبائیں اور بولنا شروع کریں</div>
          
          <div class="output-box" id="output">میسج اور AI کا جواب یہاں نظر آئے گا...</div>
        </div>

        <script>
          const micButton = document.getElementById('micButton');
          const listeningStatus = document.getElementById('listeningStatus');
          const outputBox = document.getElementById('output');
          
          // موبائل اور براؤزر کی وائس ریکگنیشن چیک کرنا
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          
          if (!SpeechRecognition) {
            outputBox.innerText = "آپ کا موبائل براؤزر وائس ٹائپنگ کو سپورٹ نہیں کرتا۔ برائے مہربانی گوگل کروم (Chrome) استعمال کریں۔";
            micButton.disabled = true;
          } else {
            const recognition = new SpeechRecognition();
            recognition.lang = 'ur-PK'; // اردو زبان سیٹ کی ہے
            recognition.interimResults = false;
            
            let isListening = false;
            
            micButton.addEventListener('click', () => {
              if (!isListening) {
                recognition.start();
              } else {
                recognition.stop();
              }
            });
            
            recognition.onstart = () => {
              isListening = true;
              micButton.classList.add('listening');
              listeningStatus.innerText = "میں سن رہا ہوں... بولئے!";
            };
            
            recognition.onend = () => {
              isListening = false;
              micButton.classList.remove('listening');
              listeningStatus.innerText = "بٹن دبائیں اور بولنا شروع کریں";
            };
            
            recognition.onresult = async (event) => {
              const speechToText = event.results[0][0].transcript;
              outputBox.innerText = "آپ نے کہا: " + speechToText + "\\n\\nAI سوچ رہا ہے...";
              
              // کلاؤڈ فلیر کے AI ماڈل کو ٹیکسٹ بھیجنا
              try {
                const response = await fetch(window.location.href, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: speechToText })
                });
                const result = await response.json();
                
                outputBox.innerText = "آپ نے کہا: " + speechToText + "\\n\\nAI کا جواب:\\n" + result.reply;
                
                // آواز میں جواب پڑھ کر سنانے کے لیے (Text-to-Speech)
                const utterance = new SpeechSynthesisUtterance(result.reply);
                utterance.lang = 'ur-PK';
                window.speechSynthesis.speak(utterance);
                
              } catch (err) {
                outputBox.innerText = "خرابی: سسٹم کنیکٹ نہیں ہو سکا۔";
              }
            };
          }
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" }
    });
  },
};
      
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const jsonResponse = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
      });

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // AI chat API
    if (request.method === "POST") {
      try {
        const data = await request.json();
        const message = String(data.message || "").trim();
        const language = String(data.language || "ur");

        if (!message) {
          return jsonResponse(
            { reply: "براہِ کرم اپنا پیغام لکھیں یا بولیں۔" },
            400
          );
        }

        if (!env.AI) {
          return jsonResponse(
            {
              reply:
                "Cloudflare AI ابھی منسلک نہیں ہے۔ براہِ کرم اپنے Worker میں AI binding چیک کریں۔",
            },
            503
          );
        }

        const languageInstructions = {
          ur: "جواب اردو رسم الخط میں دیں۔ آسان، صاف اور قدرتی پاکستانی اردو استعمال کریں۔",
          ps: "ځواب په پښتو ژبه ورکړئ. ساده او طبیعي پښتو وکاروئ.",
          en: "Reply in clear, natural English.",
        };

        const instruction =
          languageInstructions[language] || languageInstructions.ur;

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content:
                  "You are My Agent, a helpful multilingual voice assistant. " +
                  instruction +
                  " Answer the user's question helpfully. Do not claim to perform actions you have not performed.",
              },
              {
                role: "user",
                content: message,
              },
            ],
          }
        );

        return jsonResponse({
          reply:
            result.response ||
            result.result ||
            "معذرت، اس وقت جواب نہیں مل سکا۔",
        });
      } catch (error) {
        return jsonResponse(
          {
            reply:
              "معذرت، سسٹم میں مسئلہ پیش آیا۔ براہِ کرم دوبارہ کوشش کریں۔",
          },
          500
        );
      }
    }

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Mobile chat interface
    const html = `<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#101828">
<title>My Agent</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#101828;color:#f9fafb;font-family:Arial,"Noto Nastaliq Urdu",sans-serif;min-height:100vh}
.app{max-width:600px;margin:auto;min-height:100vh;display:flex;flex-direction:column;padding:16px}
header{text-align:center;padding:18px 8px}
header h1{margin:0 0 8px;font-size:28px}
header p{color:#cbd5e1;font-size:14px}
select,textarea,button{font:inherit}
select{width:100%;padding:12px;border-radius:12px;background:#1f2937;color:white;border:1px solid #475569;margin:8px 0}
.chat{flex:1;min-height:220px;max-height:55vh;overflow-y:auto;padding:12px 0}
.msg{padding:13px 15px;margin:10px 0;border-radius:15px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8}
.user{background:#374151;margin-right:35px}
.bot{background:#1d4ed8;margin-left:20px}
.controls{position:sticky;bottom:0;background:#101828;padding:12px 0 20px}
textarea{width:100%;resize:vertical;min-height:65px;padding:13px;border-radius:12px;background:#1f2937;color:white;border:1px solid #475569}
.buttons{display:flex;gap:10px;margin-top:10px}
button{border:0;border-radius:12px;padding:13px;cursor:pointer;font-weight:bold}
#send{flex:1;background:#2563eb;color:white}
#mic{background:#dc2626;color:white;min-width:62px;font-size:21px}
#mic.listening{background:#16a34a}
#speak{background:#334155;color:white}
#status{text-align:center;color:#cbd5e1;font-size:13px;padding:8px}
button:disabled{opacity:.5}
</style>
</head>
<body>
<div class="app">
<header>
<h1>🤖 My Agent</h1>
<p>آپ کا ذاتی کثیراللسانی AI معاون</p>
<select id="language" aria-label="زبان منتخب کریں">
<option value="ur">اردو</option>
<option value="ps">پشتو</option>
<option value="en">English</option>
</select>
</header>

<div class="chat" id="chat" aria-live="polite">
<div class="msg bot">السلام علیکم! میں My Agent ہوں۔ آپ اردو، پشتو یا انگریزی میں بات کر سکتے ہیں۔</div>
</div>

<div id="status">پیغام لکھیں یا مائیک دبائیں۔</div>
<div class="controls">
<textarea id="message" placeholder="اپنا پیغام یہاں لکھیں..." aria-label="پیغام"></textarea>
<div class="buttons">
<button id="mic" type="button" aria-label="مائیک">🎙️</button>
<button id="send" type="button">پیغام بھیجیں ➤</button>
<button id="speak" type="button">🔊</button>
</div>
</div>
</div>

<script>
const chat = document.getElementById("chat");
const messageBox = document.getElementById("message");
const languageBox = document.getElementById("language");
const statusBox = document.getElementById("status");
const sendButton = document.getElementById("send");
const micButton = document.getElementById("mic");
const speakButton = document.getElementById("speak");

let lastReply = "";
let recognition = null;
let listening = false;

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function locale() {
  const values = {ur:"ur-PK", ps:"ps-AF", en:"en-US"};
  return values[languageBox.value] || "ur-PK";
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    statusBox.textContent = "اس براؤزر میں آواز سنانے کی سہولت دستیاب نہیں۔";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale();
  window.speechSynthesis.speak(utterance);
}

async function sendMessage(text) {
  const content = (text || messageBox.value).trim();
  if (!content) {
    statusBox.textContent = "پہلے پیغام لکھیں یا بولیں۔";
    return;
  }

  addMessage(content, "user");
  messageBox.value = "";
  sendButton.disabled = true;
  statusBox.textContent = "My Agent جواب تیار کر رہا ہے...";

  try {
    const response = await fetch(window.location.pathname, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        message: content,
        language: languageBox.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.reply || "جواب حاصل نہیں ہو سکا۔");
    }

    lastReply = data.reply || "جواب موصول نہیں ہوا۔";
    addMessage(lastReply, "bot");
    statusBox.textContent = "جواب موصول ہو گیا۔";
    speak(lastReply);
  } catch (error) {
    addMessage(
      error.message || "کنکشن میں مسئلہ ہے۔ دوبارہ کوشش کریں۔",
      "bot"
    );
    statusBox.textContent = "کنکشن یا AI میں مسئلہ پیش آیا۔";
  } finally {
    sendButton.disabled = false;
  }
}

sendButton.addEventListener("click", () => sendMessage());

messageBox.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

speakButton.addEventListener("click", () => {
  if (lastReply) speak(lastReply);
  else statusBox.textContent = "ابھی سنانے کے لیے کوئی جواب نہیں۔";
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.interimResults = false;
  recognition.continuous = false;

  micButton.addEventListener("click", () => {
    if (listening) {
      recognition.stop();
      return;
    }
    recognition.lang = locale();
    try {
      recognition.start();
    } catch (error) {
      statusBox.textContent = "مائیک دوبارہ شروع کرنے سے پہلے انتظار کریں۔";
    }
  });

  recognition.onstart = () => {
    listening = true;
    micButton.classList.add("listening");
    statusBox.textContent = "میں سن رہا ہوں، بولیے...";
  };

  recognition.onend = () => {
    listening = false;
    micButton.classList.remove("listening");
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    messageBox.value = transcript;
    sendMessage(transcript);
  };

  recognition.onerror = event => {
    statusBox.textContent = "مائیک کی خرابی: " + event.error;
  };
} else {
  micButton.disabled = true;
  statusBox.textContent =
    "آواز کی شناخت دستیاب نہیں۔ آپ پیغام ٹائپ کرکے بھیج سکتے ہیں۔";
}
</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
