// netlify/functions/qa-analyse.js
// This serverless function runs on Netlify's servers.
// It receives the QA request from your frontend, adds your secret API key,
// forwards it to Claude, and sends the response back.
// Your API key never reaches the browser.

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // Your Anthropic API key is stored as an environment variable in Netlify
  // (you'll set this up in the Netlify dashboard — instructions in the guide)
  const API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured. Set ANTHROPIC_API_KEY in Netlify environment variables." }),
    };
  }

  try {
    // Parse the request from the frontend
    const body = JSON.parse(event.body);

    // Forward to Anthropic API with the secret key
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 4000,
        system: body.system || "",
        messages: body.messages || [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: data.error || "API request failed" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
