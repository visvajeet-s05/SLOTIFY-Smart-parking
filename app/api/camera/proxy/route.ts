import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js MJPEG Proxy Support
 * Use cases: 
 *   1. Accessing local HTTP MJPEG streams via HTTPS/Ngrok (Solves Mixed Content) 
 *   2. Circumventing CORS or IP-level blocking for local video feeds 
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target");

    if (!target) {
      return NextResponse.json({ error: "No target URL provided" }, { status: 400 });
    }

    // Reconstruct the full target URL with any additional query params (like clean=true)
    const targetUrl = new URL(target);
    searchParams.forEach((value, key) => {
      if (key !== "target") {
        targetUrl.searchParams.set(key, value);
      }
    });

    console.log(`[Camera Proxy] Fetching: ${targetUrl.toString()}`);

    // Fetch the MJPEG stream from the local AI service
    const response = await fetch(targetUrl.toString(), {
      cache: "no-store",
    });

    if (!response.ok || !response.body) {
      console.error(`[Camera Proxy] Failed to connect to ${target}: ${response.statusText}`);
      return NextResponse.json({ error: "Failed to connect to camera source" }, { status: 502 });
    }

    // Set streaming headers
    const headers = new Headers();
    headers.set("Content-Type", "multipart/x-mixed-replace; boundary=frame");
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Connection", "keep-alive");

    // Pipe the body stream directly to the response
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("[Camera Proxy] Internal error:", error.message);
    return NextResponse.json({ error: "Proxy connection failed" }, { status: 500 });
  }
}
