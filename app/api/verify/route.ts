import { NextRequest, NextResponse } from "next/server";

// World ID Cloud Verification endpoint
// Docs: https://docs.worldcoin.org/reference/api#verify-proof

const WORLD_ID_APP_ID = process.env.WORLD_ID_APP_ID ?? "app_staging_trust_circle";
const WORLD_ID_ACTION = process.env.WORLD_ID_ACTION ?? "register";

interface VerifyRequestBody {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
  signal?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequestBody = await request.json();

    const { merkle_root, nullifier_hash, proof, verification_level, signal } = body;

    // Validate required fields
    if (!merkle_root || !nullifier_hash || !proof) {
      return NextResponse.json(
        { success: false, error: "Missing required proof fields" },
        { status: 400 },
      );
    }

    // Call World ID Cloud Verification API
    const verifyRes = await fetch(
      `https://developer.worldcoin.org/api/v2/verify/${WORLD_ID_APP_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merkle_root,
          nullifier_hash,
          proof,
          verification_level: verification_level || "orb",
          action: WORLD_ID_ACTION,
          signal: signal ?? "",
        }),
      },
    );

    if (verifyRes.ok) {
      const data = await verifyRes.json();
      return NextResponse.json({
        success: true,
        nullifier_hash: data.nullifier_hash,
        verification_level: data.verification_level ?? verification_level,
      });
    }

    // World ID API returned an error
    const errorData = await verifyRes.json().catch(() => ({}));

    // In development/testnet, allow mock proofs through
    if (process.env.NODE_ENV === "development" || process.env.ALLOW_MOCK_PROOFS === "true") {
      console.warn("[verify] World ID API rejected proof, allowing mock in dev mode");
      return NextResponse.json({
        success: true,
        nullifier_hash,
        verification_level,
        mock: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
        code: errorData?.code ?? "unknown",
        detail: errorData?.detail ?? verifyRes.statusText,
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[verify] Server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
