
export default {
async fetch(request, env) {
const corsHeaders = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

if (request.method === "OPTIONS") {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });

try {
  if (request.method === "GET") {
    return jsonResponse({
      name: "My Agent",
      status: "running",
      message: "My Agent is ready!",
      languages: ["Pashto", "Urdu", "English"],
      version: "1.0.0",
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405
    );
  }

  const body = await request.json();
  const message = body.message;

  if (
    typeof message !== "string" ||
    message.trim().length === 0
  ) {
    return jsonResponse(
      { error: "Please provide a message." },
      400
    );
  }

  if (message.length > 10000) {
    return jsonResponse(
      { error: "Message is too long." },
      413
    );
  }

  const apiKey = env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonResponse({
      name: "My Agent",
      reply:
        "My Agent is running, but its AI connection is not configured yet.",
      configured: false,
    });
  }

  const aiResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are My Agent, a helpful multilingual AI assistant. Reply in the same language as the user. Support Pashto, Urdu, and English. Be honest, helpful, and safe. Ask for human confirmation before external actions.",
          },
          {
            role: "user",
            content: message.trim(),
          },
        ],
      }),
    }
  );

  if (!aiResponse.ok) {
    return jsonResponse(
      {
        error: "The AI service returned an error.",
        status: aiResponse.status,
      },
      502
    );
  }

  const aiData = await aiResponse.json();
  const reply =
    aiData.choices?.[0]?.message?.content;

  if (!reply) {
    return jsonResponse(
      { error: "No reply was received from the AI." },
      502
    );
  }

  return jsonResponse({
    name: "My Agent",
    reply,
    configured: true,
  });
} catch (error) {
  return jsonResponse(
    {
      error: "My Agent could not process the request.",
    },
    500
  );
}

},
};
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json; charset=utf-8"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    if (request.method === "GET") {
      return jsonResponse({
        name: "My Agent",
        status: "running",
        message: "My Agent is ready!",
        languages: ["Pashto", "Urdu", "English"],
        features: [
          "AI Chat",
          "Multilingual Support",
          "Voice Chat Ready",
          "Secure API"
        ],
        version: "1.0.0"
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({
        error: "Method not allowed"
      }, 405);
    }

    if (url.pathname !== "/" && url.pathname !== "/chat") {
      return jsonResponse({
        error: "Endpoint not found"
      }, 404);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({
        error: "Please send valid JSON."
      }, 400);
    }

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return jsonResponse({
        error: "Please enter a message."
      }, 400);
    }

    if (message.length > 12000) {
      return jsonResponse({
        error: "Message is too long."
      }, 413);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({
        error: "AI is not configured yet.",
        message:
          "Please configure the OPENAI_API_KEY secret in Cloudflare."
      }, 503);
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are My Agent, a helpful multilingual AI assistant. " +
                  "Support Pashto, Urdu, and English. " +
                  "Reply in the language the user uses. " +
                  "If the user writes Pashto, reply in Pashto. " +
                  "If the user writes Urdu, reply in Urdu script. " +
                  "Be respectful, clear, practical, and honest. " +
                  "Never claim to have performed an action you did not perform."
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("AI API error:", response.status);

        return jsonResponse({
          error: "The AI service could not complete your request.",
          status: response.status
        }, 502);
      }

      const reply =
        result.choices?.[0]?.message?.content;

      if (!reply) {
        return jsonResponse({
          error: "The AI returned an empty response."
        }, 502);
      }

      return jsonResponse({
        name: "My Agent",
        status: "success",
        reply: reply,
        language: "auto",
        voiceSupported: false
      });

    } catch (error) {
      console.error("My Agent error:", error);

      return jsonResponse({
        error: "Unable to connect to the AI service."
      }, 502);
    }
  }
};
