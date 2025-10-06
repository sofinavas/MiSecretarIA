import type { APIRoute } from "astro";

const WEBHOOK_URL = import.meta.env.WEBHOOK_URL;
const MAX_MESSAGE_LENGTH = 2000;
const TIMEOUT_MS = 30000;
const RETRY_BACKOFF = 1.5;

interface ChatRequest {
  message: string;
  timestamp: string;
  dashboard_context: string;
  user_session: string;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function callWebhook(payload: ChatRequest, retryCount = 0): Promise<any> {
  const maxRetries = 1;
  const timeout = retryCount === 0 ? TIMEOUT_MS : TIMEOUT_MS * RETRY_BACKOFF;

  try {
    const response = await fetchWithTimeout(
      WEBHOOK_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      timeout
    );

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error: any) {
    if (
      retryCount < maxRetries &&
      (error.name === "AbortError" || error.message.includes("fetch"))
    ) {
      // Retry once with backoff
      return await callWebhook(payload, retryCount + 1);
    }
    throw error;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: ChatRequest = await request.json();

    // Validate message
    if (!body.message || typeof body.message !== "string") {
      return new Response(
        JSON.stringify({ error: "El mensaje es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (body.message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "El mensaje no puede estar vacío" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (body.message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call webhook with retry logic
    const webhookResponse = await callWebhook(body);

    // Return the webhook response
    return new Response(JSON.stringify(webhookResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Proxy error:", error);

    return new Response(
      JSON.stringify({
        error: "Proxy cayó o tardó demasiado",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
