"use client";

import { useState, useEffect, useCallback } from "react";
import { useIDKitRequest, IDKitRequestWidget, type IDKitResult } from "@worldcoin/idkit";
import { orbLegacy } from "@worldcoin/idkit";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";
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
  loadingText?: string;
}

const APP_ID = (process.env.NEXT_PUBLIC_WORLD_ID_APP_ID ?? "app_0d26d4fbe63fa4dde5322f050a3074a0") as `app_${string}`;
const ACTION = process.env.NEXT_PUBLIC_WORLD_ID_ACTION ?? "register";

function VerifyWithContext({
  rpContext,
  onSuccess,
  onError,
  buttonText = "Verify with World ID",
  loadingText = "Verifying...",
}: WorldIdVerifyProps & { rpContext: RpContext }) {
  const [widgetOpen, setWidgetOpen] = useState(false);

  const idkit = useIDKitRequest({
    app_id: APP_ID,
    action: ACTION,
    rp_context: rpContext,
    allow_legacy_proofs: true,
    environment: "staging",
    preset: orbLegacy(),
  });

  const handleSuccess = useCallback(
    (result: IDKitResult) => {
      // Extract v3 legacy proof fields
      if (result.protocol_version === "3.0" && result.responses?.[0]) {
        const resp = result.responses[0];
        onSuccess({
          merkle_root: "merkle_root" in resp ? resp.merkle_root : "",
          nullifier_hash: "nullifier" in resp ? resp.nullifier : "",
          proof: typeof resp.proof === "string" ? resp.proof : resp.proof?.[0] ?? "",
          verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
        });
      } else if (result.protocol_version === "4.0" && result.responses?.[0]) {
        // v4 proof — extract what we can
        const resp = result.responses[0];
        onSuccess({
          merkle_root: Array.isArray(resp.proof) && resp.proof.length > 4 ? resp.proof[4] : "",
          nullifier_hash: "nullifier" in resp ? resp.nullifier : "",
          proof: Array.isArray(resp.proof) ? resp.proof.slice(0, 4).join(",") : "",
          verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
        });
      } else {
        onError?.("Unexpected proof format");
      }
    },
    [onSuccess, onError],
  );

  const handleClick = () => {
    setWidgetOpen(true);
    idkit.open();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={idkit.isAwaitingUserConfirmation}
        className="w-full max-w-xs"
        size="lg"
      >
        {idkit.isAwaitingUserConfirmation ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : idkit.isSuccess ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verified!
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      <IDKitRequestWidget
        app_id={APP_ID}
        action={ACTION}
        rp_context={rpContext}
        allow_legacy_proofs={true}
        environment="staging"
        preset={orbLegacy()}
        open={widgetOpen}
        onOpenChange={setWidgetOpen}
        onSuccess={handleSuccess}
        onError={(errorCode) => {
          console.error("[IDKit] Error:", errorCode);
          onError?.(String(errorCode));
        }}
      />
    </>
  );
}

export function WorldIdVerifyButton(props: WorldIdVerifyProps) {
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchContext() {
      try {
        const res = await fetch("/api/sign-request", { method: "POST" });
        const data = await res.json();
        if (!cancelled && data.success) {
          setRpContext(data.rp_context);
        } else if (!cancelled) {
          setError(data.error ?? "Failed to get signing context");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Network error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchContext();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Button disabled className="w-full max-w-xs" size="lg">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Preparing...
      </Button>
    );
  }

  if (error || !rpContext) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetch("/api/sign-request", { method: "POST" })
              .then((r) => r.json())
              .then((d) => {
                if (d.success) setRpContext(d.rp_context);
                else setError(d.error);
              })
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false));
          }}
          variant="outline"
          className="w-full max-w-xs"
          size="lg"
        >
          Retry
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return <VerifyWithContext rpContext={rpContext} {...props} />;
}
