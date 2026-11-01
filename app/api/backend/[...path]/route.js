import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;
const STAGING_KEY = process.env.STAGING_API_KEY;


// =====================================
// BACKEND PROXY
// =====================================

async function proxyRequest(request, context) {
  try {

    // Check environment configuration
    if (!BACKEND_URL || !STAGING_KEY) {
      return NextResponse.json(
        {
          message: "Backend configuration is missing.",
        },
        {
          status: 500,
        }
      );
    }


    // Get dynamic API path
    const { path = [] } = await context.params;

    const endpoint = path.join("/");


    // Build original backend URL
    const targetUrl =
      `${BACKEND_URL.replace(/\/$/, "")}/api/v1/${endpoint}`;


    // Preserve query parameters
    const originalUrl = new URL(request.url);

    const finalUrl =
      `${targetUrl}${originalUrl.search}`;


    // Prepare backend headers
    const headers = new Headers();

    const forwardedHeaders = [
      "accept",
      "accept-language",
      "content-type",
      "authorization",
      "user-agent",
    ];

    forwardedHeaders.forEach((header) => {
      const value = request.headers.get(header);

      if (value) {
        headers.set(header, value);
      }
    });


    // Add staging key on the server only
    headers.set(
      "X-Staging-Key",
      STAGING_KEY
    );


    // Prepare request body
    const hasBody =
      request.method !== "GET" &&
      request.method !== "HEAD";

    const body = hasBody
      ? await request.arrayBuffer()
      : undefined;


    // Send request to actual backend
    const backendResponse = await fetch(
      finalUrl,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      }
    );


    // Prepare response headers
    const responseHeaders = new Headers();

    const contentType =
      backendResponse.headers.get("content-type");

    if (contentType) {
      responseHeaders.set(
        "content-type",
        contentType
      );
    }


    // Return original backend response
    return new Response(
      backendResponse.body,
      {
        status: backendResponse.status,
        headers: responseHeaders,
      }
    );

  } catch (error) {

    console.error("Backend proxy error:", error);

    return NextResponse.json(
      {
        message: "Unable to connect to backend.",
      },
      {
        status: 502,
      }
    );

  }
}


// =====================================
// SUPPORTED HTTP METHODS
// =====================================

export async function GET(request, context) {
  return proxyRequest(request, context);
}

export async function POST(request, context) {
  return proxyRequest(request, context);
}

export async function PATCH(request, context) {
  return proxyRequest(request, context);
}

export async function DELETE(request, context) {
  return proxyRequest(request, context);
}