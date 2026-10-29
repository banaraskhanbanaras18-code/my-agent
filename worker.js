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

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method === "GET") {
      return json({
        name: "My Agent",
        status: "running",
        languages: ["Pashto", "Urdu", "English"],
        aiConnected: true,
        voiceConnected: false,
        version: "1.2.0"
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await request.json();
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!message) {
        return json({ error: "Please enter a message." }, 400);
      }

      if (message.length > 4000) {
        return json({ error: "Message is too long." }, 413);
      }

      // Cloudflare Llama 3.1 ماڈل جو پشتو اور اردو بہترین سمجھتا ہے
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'You are My Agent, a helpful AI assistant. You can speak Pashto, Urdu, and English fluently. Always reply in the exact language the user writes to you.'
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
        voiceConnected: false
      });

    } catch (error) {
      return json({ error: "AI communication error: " + error.message }, 500);
    }
  }
};
      
