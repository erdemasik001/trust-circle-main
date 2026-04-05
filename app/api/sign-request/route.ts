import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";

const SIGNING_KEY = process.env.WORLD_ID_SIGNING_KEY ?? "";
const ACTION = process.env.WORLD_ID_ACTION ?? "register";

export async function POST() {
  try {
    if (!SIGNING_KEY) {
      return NextResponse.json(
        { success: false, error: "Signing key not configured" },
        { status: 500 },
      );
    }

    const rpSig = signRequest(ACTION, SIGNING_KEY, 300); // 5 min TTL

    // Subtract 30s buffer to prevent "created_at in the future" clock skew errors
    const createdAt = rpSig.createdAt - 30;
    const expiresAt = rpSig.expiresAt - 30;

    return NextResponse.json({
      success: true,
      rp_context: {
        rp_id: process.env.WORLD_ID_RP_ID ?? process.env.WORLD_ID_APP_ID ?? "",
        nonce: rpSig.nonce,
        created_at: createdAt,
        expires_at: expiresAt,
        signature: rpSig.sig,
      },
    });
  } catch (error) {
    console.error("[sign-request] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign request" },
      { status: 500 },
    );
  }
}
