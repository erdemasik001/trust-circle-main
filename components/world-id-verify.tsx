"use client";

import { useState, useEffect, useCallback } from "react";
import { IDKitRequestWidget, type IDKitResult } from "@worldcoin/idkit";
import { orbLegacy } from "@worldcoin/idkit";
import { Loader2, Shield } from "lucide-react";
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

const APP_ID = (process.env.NEXT_PUBLIC_WORLD_ID_APP_ID ?? "app_0d26d4fbe63fa4dde5322f050a3074a0") as `app_${string}`;
const ACTION = process.env.NEXT_PUBLIC_WORLD_ID_ACTION ?? "register";

export function WorldIdVerifyButton({
  onSuccess,
  onError,
  buttonText = "Verify with World ID",
}: WorldIdVerifyProps) {
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rp_context on mount
  const fetchContext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sign-request", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setRpContext(data.rp_context);
      } else {
        setError(data.error ?? "Failed to get signing context");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const handleSuccess = useCallback(
    (result: IDKitResult) => {
      console.log("[IDKit] Success:", JSON.stringify(result, null, 2));

      if (result.responses?.[0]) {
        const resp = result.responses[0];

        if ("merkle_root" in resp) {
          // v3 legacy proof
          onSuccess({
            merkle_root: resp.merkle_root,
            nullifier_hash: resp.nullifier,
            proof: typeof resp.proof === "string" ? resp.proof : "",
            verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
          });
        } else if ("nullifier" in resp) {
          // v4 proof
          onSuccess({
            merkle_root: Array.isArray(resp.proof) && resp.proof.length > 4 ? resp.proof[4] : "",
            nullifier_hash: resp.nullifier,
            proof: Array.isArray(resp.proof) ? resp.proof.slice(0, 4).join(",") : "",
            verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
          });
        }
      } else {
        onError?.("No proof in response");
      }
    },
    [onSuccess, onError],
  );

  const handleClick = async () => {
    if (!rpContext) {
      await fetchContext();
    }
    setWidgetOpen(true);
  };

  if (loading) {
    return (
      <Button disabled className="w-full max-w-xs" size="lg">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Preparing...
      </Button>
    );
  }

  if (error && !rpContext) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button onClick={fetchContext} variant="outline" className="w-full max-w-xs" size="lg">
          Retry
        </Button>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Button onClick={handleClick} className="w-full max-w-xs" size="lg">
        <Shield className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>

      {rpContext && (
        <IDKitRequestWidget
          app_id={APP_ID}
          action={ACTION}
          rp_context={rpContext}
          allow_legacy_proofs={true}
          environment="production"
          preset={orbLegacy()}
          open={widgetOpen}
          onOpenChange={(open) => {
            setWidgetOpen(open);
            if (!open) {
              // Widget kapandıysa yeni rp_context al (nonce tek kullanımlık)
              fetchContext();
            }
          }}
          onSuccess={handleSuccess}
          onError={(errorCode) => {
            console.error("[IDKit] Error code:", errorCode);
            onError?.(String(errorCode));
            setWidgetOpen(false);
            fetchContext();
          }}
        />
      )}
    </>
  );
}
