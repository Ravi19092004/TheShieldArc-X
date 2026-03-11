// e:\main major\packages\web\app\api\predict\route.ts
import { NextResponse } from "next/server";

// The URL of our Python API
const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    // 1. Get the URL from the incoming request from our frontend
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 2. Forward the request to the FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    // 3. Handle a failed response from the FastAPI backend
    if (!response.ok) {
      const errorData = await response.json();
      console.error("FastAPI Error:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Prediction service failed" },
        { status: response.status }
      );
    }

    // 4. Return the successful prediction to our frontend
    const data = await response.json();

    // Ensure safe_percentage and unsafe_percentage are included
    const enhancedData = {
      ...data,
      safe_percentage: data.safe_percentage ?? (data.prediction === 'Safe' ? 100 - data.confidence * 100 : 0),
      unsafe_percentage: data.unsafe_percentage ?? (data.prediction === 'Unsafe' ? data.confidence * 100 : 0),
    };

    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error("Error in prediction proxy route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
