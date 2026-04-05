"use client";

import { useState, useCallback } from "react";
import { Loader2, Shield, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RpContext {
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
}

export interface WorldIdProof {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
}

interface WorldIdVerifyProps {
  onSuccess: (proof: WorldIdProof) => void;
  onError?: (error: string) => void;
  buttonText?: string;
}

const APP_ID = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID ?? "app_0d26d4fbe63fa4dde5322f050a3074a0";
const ACTION = process.env.NEXT_PUBLIC_WORLD_ID_ACTION ?? "register";

export function WorldIdVerifyButton({
  onSuccess,
  onError,
  buttonText = "Verify with World ID",
}: WorldIdVerifyProps) {
  const [state, setState] = useState<"idle" | "loading" | "waiting" | "confirming" | "error">("idle");
  const [connectorURI, setConnectorURI] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    setState("loading");
    setErrorMsg(null);
    setConnectorURI(null);

    try {
      // 1. Fetch rp_context from server
      const signRes = await fetch("/api/sign-request", { method: "POST" });
      const signData = await signRes.json();
      if (!signData.success) throw new Error(signData.error ?? "Failed to sign request");
      const rpContext: RpContext = signData.rp_context;

      // 2. Dynamically import IDKit core (avoids SSR + WASM issues)
      const { IDKit, orbLegacy } = await import("@worldcoin/idkit-core");

      // 3. Create verification request
      console.log("[IDKit] Creating request...");
      const request = await IDKit.request({
        app_id: APP_ID as `app_${string}`,
        action: ACTION,
        rp_context: rpContext,
        allow_legacy_proofs: true,
        environment: "production",
      }).preset(orbLegacy());

      console.log("[IDKit] Request created, connectorURI:", request.connectorURI);
      setConnectorURI(request.connectorURI);
      setState("waiting");

      // 4. Poll until completion
      const completion = await request.pollUntilCompletion({
        pollInterval: 2000,
        timeout: 120000,
      });

      if (completion.success) {
        console.log("[IDKit] Success:", JSON.stringify(completion.result, null, 2));
        const result = completion.result;
        if (result.responses?.[0]) {
          const resp = result.responses[0];
          if ("merkle_root" in resp) {
            onSuccess({
              merkle_root: resp.merkle_root,
              nullifier_hash: resp.nullifier,
              proof: typeof resp.proof === "string" ? resp.proof : "",
              verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
            });
          } else if ("nullifier" in resp) {
            onSuccess({
              merkle_root: Array.isArray(resp.proof) && resp.proof.length > 4 ? resp.proof[4] : "",
              nullifier_hash: resp.nullifier,
              proof: Array.isArray(resp.proof) ? resp.proof.slice(0, 4).join(",") : "",
              verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
            });
          }
        }
        setState("idle");
      } else {
        throw new Error(completion.error ?? "Verification failed");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("[IDKit] Error:", msg, e);
      setErrorMsg(msg);
      setState("error");
      onError?.(msg);
    }
  }, [onSuccess, onError]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleVerify}
        disabled={state === "loading" || state === "waiting" || state === "confirming"}
        className="w-full max-w-xs"
        size="lg"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      {connectorURI && (state === "waiting" || state === "confirming") && (
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-white">
          <QrCode className="h-8 w-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">
            World App ile taratın:
          </p>
          <a
            href={connectorURI}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 underline break-all max-w-[250px]"
          >
            QR Link
          </a>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Bağlantı bekleniyor...
          </div>
        </div>
      )}

      {state === "error" && errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
