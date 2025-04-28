// app/api/graphql/route.js
import { getToken } from "@/lib/auth/token";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const token = await getToken();

    // Get the body content first
    let bodyText;
    try {
      bodyText = await request.text();
    } catch (error) {
      console.error("Error reading request body:", error);
      return NextResponse.json(
        { errors: [{ message: "Failed to read request body" }] },
        { status: 400 }
      );
    }

    // Validate that the body is proper JSON
    try {
      JSON.parse(bodyText);
    } catch (error) {
      console.error("Invalid GraphQL request JSON:", error);
      return NextResponse.json(
        { errors: [{ message: "Invalid request: Not a valid JSON body" }] },
        { status: 400 }
      );
    }

    // Prepare headers
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Copy important headers from original request
    if (request.headers.has("accept")) {
      headers.set("Accept", request.headers.get("accept"));
    }

    // Add auth token if available
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Get the target URL
    const url =
      process.env.STRAPI_GRAPHQL_URL || "https://api.doulitsa.gr/graphql";

    // Forward the request to the actual GraphQL endpoint
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: bodyText,
    });

    // If the response from Strapi is not ok, handle the error
    if (!response.ok) {
      const statusCode = response.status;
      let errorMessage;

      try {
        // Try to get error details
        const errorBody = await response.text();
        console.error(
          `Strapi GraphQL error (${statusCode}):`,
          errorBody.substring(0, 500)
        );
        errorMessage = `GraphQL server responded with status ${statusCode}`;
      } catch (readError) {
        console.error("Failed to read error response:", readError);
        errorMessage = "Failed to read error response from GraphQL server";
      }

      return NextResponse.json(
        { errors: [{ message: errorMessage }] },
        { status: statusCode }
      );
    }

    // Try to parse the successful response
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);

      // Clone and get text for additional debugging
      try {
        const clonedResponse = response.clone();
        const textResponse = await clonedResponse.text();
        console.error("Raw response:", textResponse.substring(0, 500));
      } catch (cloneError) {
        console.error("Failed to get raw response text:", cloneError);
      }

      return NextResponse.json(
        { errors: [{ message: "Invalid JSON response from GraphQL server" }] },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Unhandled GraphQL proxy error:", error);
    return NextResponse.json(
      { errors: [{ message: "Internal server error in GraphQL proxy" }] },
      { status: 500 }
    );
  }
}
