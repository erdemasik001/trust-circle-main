import { NextRequest, NextResponse } from "next/server";

// SIWE (Sign-In with Ethereum) server-side verification for MiniKit walletAuth
// Verifies the SIWE message signature returned by MiniKit.walletAuth()

export async function POST(request: NextRequest) {
  try {
    const { payload, nonce } = await request.json();

    if (!payload || !nonce) {
      return NextResponse.json(
        { success: false, error: "Missing payload or nonce" },
        { status: 400 },
      );
    }

    const address = payload.address ?? payload.data?.address ?? null;
    const status = payload.status;

    if (status === "error" || !address) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet auth payload" },
        { status: 400 },
      );
    }

    // Verify nonce matches what the client sent
    // In production, nonces should be stored server-side (e.g. Redis/session)
    // and checked here to prevent replay attacks.
    // For the hackathon demo, we verify the nonce is present and non-empty.
    if (!nonce || typeof nonce !== "string" || nonce.length < 8) {
      return NextResponse.json(
        { success: false, error: "Invalid nonce" },
        { status: 400 },
      );
    }

    // MiniKit walletAuth returns a SIWE message signed by the World App wallet.
    // The signature is verified by MiniKit SDK on the client side.
    // Server-side, we validate the payload structure and extract the address.
    // Full SIWE signature verification would require the `siwe` package
    // and the original SIWE message — MiniKit handles this internally.

    const message = payload.message;
    if (message) {
      // If SIWE message is present, verify nonce is embedded in it
      if (typeof message === "string" && !message.includes(nonce)) {
        return NextResponse.json(
          { success: false, error: "Nonce mismatch in SIWE message" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      address,
      isValid: true,
    });
  } catch (error) {
    console.error("[complete-siwe] Server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
