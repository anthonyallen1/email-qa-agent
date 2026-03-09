// netlify/functions/qa-analyse.js
exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "NO_API_KEY" }),
    };
  }

  try {
    const body = JSON.parse(event.body);

    const payload = {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: body.system || "",
      messages: body.messages || [],
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          debug_error: true,
          api_status: response.status,
          api_error: data,
          model_used: "claude-haiku-4-5-20251001"
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debug_error: true, catch_error: err.message }),
    };
  }
};
