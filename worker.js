export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const json = (data, status = 200) =>
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
          return json({ reply: "براہِ کرم اپنا پیغام لکھیں یا بولیں۔" }, 400);
        }

        if (!env.AI) {
          return json({
            reply:
              "Cloudflare AI منسلک نہیں ہے۔ اپنے Worker کی Settings میں AI binding چیک کریں۔",
          }, 503);
        }

        const instructions = {
          ur: "جواب آسان، صاف پاکستانی اردو میں اردو رسم الخط کے ساتھ دیں۔",
          ps: "ځواب په ساده او طبیعي پښتو ژبه ورکړئ.",
          en: "Reply in clear, natural English.",
        };

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content:
                  "You are My Agent, a helpful multilingual AI assistant. " +
                  (instructions[language] || instructions.ur) +
                  " Be honest, helpful, and do not claim to perform actions you have not performed.",
              },
              {
                role: "user",
                content: message,
              },
            ],
          }
        );

        return json({
          reply:
            result.response ||
            result.result ||
            "معذرت، ابھی جواب نہیں مل سکا۔",
        });
      } catch (error) {
        return json(
          {
            reply:
              "سسٹم میں خرابی پیش آئی۔ Cloudflare AI ماڈل اور سیٹنگز چیک کریں۔",
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

    // My Agent chat screen
    const html = `<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#101828">
<title>My Agent</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  background:#101828;
  color:#f9fafb;
  font-family:Arial,sans-serif;
  min-height:100vh;
}
.app{
  max-width:600px;
  margin:auto;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  padding:16px;
}
header{text-align:center;padding:18px 8px}
header h1{margin:0 0 8px;font-size:28px}
header p{color:#cbd5e1;font-size:14px}
select,textarea,button{font:inherit}
select{
  width:100%;
  padding:12px;
  border-radius:12px;
  background:#1f2937;
  color:white;
  border:1px solid #475569;
  margin:8px 0;
}
.chat{
  flex:1;
  min-height:220px;
  max-height:55vh;
  overflow-y:auto;
  padding:12px 0;
}
.msg{
  padding:13px 15px;
  margin:10px 0;
  border-radius:15px;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
  line-height:1.8;
}
.user{background:#374151;margin-right:30px}
.bot{background:#1d4ed8;margin-left:20px}
.controls{
  position:sticky;
  bottom:0;
  background:#101828;
  padding:12px 0 20px;
}
textarea{
  width:100%;
  resize:vertical;
  min-height:65px;
  padding:13px;
  border-radius:12px;
  background:#1f2937;
  color:white;
  border:1px solid #475569;
}
.buttons{display:flex;gap:10px;margin-top:10px}
button{
  border:0;
  border-radius:12px;
  padding:13px;
  cursor:pointer;
  font-weight:bold;
}
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
  <p>آپ کا ذاتی AI معاون</p>
  <select id="language" aria-label="زبان منتخب کریں">
    <option value="ur">اردو</option>
    <option value="ps">پشتو</option>
    <option value="en">English</option>
  </select>
</header>

<div class="chat" id="chat" aria-live="polite">
  <div class="msg bot">السلام علیکم! میں My Agent ہوں۔ اردو، پشتو یا انگریزی منتخب کرکے اپنا پیغام لکھیں یا مائیک دبائیں۔</div>
</div>

<div id="status">پیغام لکھیں یا مائیک دبائیں۔</div>

<div class="controls">
  <textarea id="message" placeholder="اپنا پیغام یہاں لکھیں..."></textarea>
  <div class="buttons">
    <button id="mic" type="button" aria-label="مائیک">🎙️</button>
    <button id="send" type="button">پیغام بھیجیں ➤</button>
    <button id="speak" type="button" aria-label="جواب دوبارہ سنیں">🔊</button>
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
  const languages = {
    ur: "ur-PK",
    ps: "ps-AF",
    en: "en-US"
  };
  return languages[languageBox.value] || "ur-PK";
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
      headers: {
        "Content-Type": "application/json"
      },
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
    statusBox.textContent = "AI یا کنکشن میں مسئلہ پیش آیا۔";
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
  if (lastReply) {
    speak(lastReply);
  } else {
    statusBox.textContent = "ابھی سنانے کے لیے کوئی جواب نہیں۔";
  }
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
      statusBox.textContent = "براہِ کرم چند لمحے انتظار کرکے دوبارہ دبائیں۔";
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
