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
      
