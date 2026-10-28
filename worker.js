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
        aiConnected: false,
        voiceConnected: false,
        version: "1.1.0"
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await request.json();
      const message =
        typeof body.message === "string" ? body.message.trim() : "";

      if (!message) {
        return json({ error: "Please enter a message." }, 400);
      }

      if (message.length > 4000) {
        return json({ error: "Message is too long." }, 413);
      }

      return json({
        name: "My Agent",
        status: "message-received",
        receivedMessage: message,
        reply: "ستاسو پیغام ترلاسه شو۔ آپ کا پیغام موصول ہوگیا۔",
        aiConnected: false,
        voiceConnected: false
      });
    } catch {
      return json({ error: "Invalid JSON request." }, 400);
    }
  }
};
