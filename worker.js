export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8"
        }
      });

    // 1. OPTIONS چیک (سیکیورٹی کے لیے)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. GET چیک (سرور چیک کرنے کے لیے)
    if (request.method === "GET") {
      return json({
        name: "My Agent",
        status: "running",
        languages: ["Pashto", "Urdu", "English"],
        aiConnected: true,
        voiceConnected: true,
        version: "2.0.0"
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    // 3. لائیو آواز کا سیشن (Voice Gateway)
    if (request.url.endsWith("/voice")) {
      try {
        const voiceSession = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          voice: {
            input: "microphone",
            output: "audio",
            system_prompt: "You are My Agent, a face-to-face voice assistant. You must converse directly via real-time speech. Fluently speak Pashto (as primary), Urdu, and English. Match the language spoken by the user instantly and do not make grammatical mistakes.",
            default_language: "ps"
          }
        });
        return json(voiceSession);
      } catch (error) {
        return json({ error: "Voice connection failed: " + error.message }, 500);
      }
    }

    // 4. لکھائی والی چیٹ موڈ (Text Chat)
    try {
      const body = await request.json();
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!message) {
        return json({ error: "Please enter a message." }, 400);
      }

      if (message.length > 4000) {
        return json({ error: "Message is too long." }, 413);
      }

      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'You are My Agent, a helpful AI assistant. You can speak Pashto, Urdu, and English fluently. Always detect the user\'s language and reply in that exact language.'
          },
          { role: 'user', content: message }
        ]
      });

      let resolvedReply = "";
      if (aiResponse && typeof aiResponse === 'object') {
        resolvedReply = aiResponse.response || aiResponse.reply || aiResponse.text || "";
      } else if (typeof aiResponse === 'string') {
        resolvedReply = aiResponse;
      }

      if (!resolvedReply) {
        resolvedReply = "معذرت، میں جواب نہیں بنا سکا۔";
      }

      return json({
        name: "My Agent",
        status: "success",
        receivedMessage: message,
        reply: resolvedReply,
        aiConnected: true,
        voiceConnected: true
      });

    } catch (error) {
      return json({ error: "AI error: " + error.message }, 500);
    }
  }
};
        
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
          "Content-Type": "application/json",
        },
      });

    // 1. OPTIONS چیک (سیکیورٹی کے لیے)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // یہاں آپ کا باقی کوڈ آئے گا (جیسے GET یا POST)
    return json({ message: "Worker is running successfully!" });
  }
            }
                  
