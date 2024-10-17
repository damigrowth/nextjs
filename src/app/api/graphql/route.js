import { getData } from "@/lib/client/operations";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { query, variables } = await request.json();

    const data = await getData(query, variables);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
