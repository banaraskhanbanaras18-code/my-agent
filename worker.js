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

const url = new URL(request.url);

if (request.method === "GET") {
  return json({
    name: "My Agent",
    status: "running",
    message: "My Agent is ready!",
    languages: ["Pashto", "Urdu", "English"],
    version: "1.0.0"
  });
}

if (request.method !== "POST") {
  return json({ error: "Method not allowed" }, 405);
}

try {
  const body = await request.json();
  const message = String(body.message || "").trim();

  if (!message) {
    return json({ error: "Please enter a message." }, 400);
  }

  return json({
    name: "My Agent",
    reply: "ستاسو پیغام ترلاسه شو. آپ کا پیغام موصول ہوگیا۔",
    receivedMessage: message,
    status: "basic-chat-ready",
    note: "Voice and AI model integration is not configured yet."
  });
} catch {
  return json({ error: "Invalid JSON request." }, 400);
}

}
};
