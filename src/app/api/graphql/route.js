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
      duplex: "half",
    });

    // Check if the response is OK before trying to parse it
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GraphQL API error response:", errorText);
      return NextResponse.json(
        {
          errors: [
            { message: `GraphQL API responded with status ${response.status}` },
          ],
        },
        { status: response.status }
      );
    }

    // Try to parse the response as JSON with error handling
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Get the response text for debugging
      const responseText = await response.clone().text();
      console.error("Response text:", responseText.substring(0, 200)); // Log first 200 chars

      return NextResponse.json(
        { errors: [{ message: "Invalid JSON response from GraphQL API" }] },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      { errors: [{ message: "Failed to fetch from GraphQL API" }] },
      { status: 500 }
    );
  }
}
