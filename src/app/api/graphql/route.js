// app/api/graphql/route.js
import { getToken } from "@/lib/auth/token";
import { NextResponse } from "next/server";

export async function POST(request) {
  const token = await getToken();

  // Clone the request and add Authorization header
  const headers = new Headers(request.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Get the body content
  const body = await request.text();

  // Get the original URL from the request
  const url =
    process.env.STRAPI_GRAPHQL_URL || "https://api.doulitsa.gr/graphql";

  try {
    // Forward the request to the actual GraphQL endpoint
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body,
      duplex: "half", // Add this line to fix the error
    });

    // Clone and return the response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      { errors: [{ message: "Failed to fetch from GraphQL API" }] },
      { status: 500 }
    );
  }
}
