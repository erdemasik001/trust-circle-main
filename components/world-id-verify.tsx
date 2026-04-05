"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useIDKitRequest, type IDKitResult } from "@worldcoin/idkit";
import { orbLegacy } from "@worldcoin/idkit";
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

const APP_ID = (process.env.NEXT_PUBLIC_WORLD_ID_APP_ID ?? "app_0d26d4fbe63fa4dde5322f050a3074a0") as `app_${string}`;
const ACTION = process.env.NEXT_PUBLIC_WORLD_ID_ACTION ?? "register";

function VerifyWithContext({
  rpContext,
  onSuccess,
  onError,
  buttonText = "Verify with World ID",
}: WorldIdVerifyProps & { rpContext: RpContext }) {
  // Use refs for callbacks to prevent re-render loops
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const errorHandledRef = useRef(false);
  const successHandledRef = useRef(false);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const idkit = useIDKitRequest({
    app_id: APP_ID,
    action: ACTION,
    rp_context: rpContext,
    allow_legacy_proofs: true,
    environment: "production",
    preset: orbLegacy(),
  });

  // Handle success - only once
  useEffect(() => {
    if (idkit.isSuccess && idkit.result && !successHandledRef.current) {
      successHandledRef.current = true;
      console.log("[IDKit] Success:", JSON.stringify(idkit.result, null, 2));
      const result = idkit.result;
      if (result.responses?.[0]) {
        const resp = result.responses[0];
        if ("merkle_root" in resp) {
          onSuccessRef.current({
            merkle_root: resp.merkle_root,
            nullifier_hash: resp.nullifier,
            proof: typeof resp.proof === "string" ? resp.proof : "",
            verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
          });
        } else if ("nullifier" in resp) {
          onSuccessRef.current({
            merkle_root: Array.isArray(resp.proof) && resp.proof.length > 4 ? resp.proof[4] : "",
            nullifier_hash: resp.nullifier,
            proof: Array.isArray(resp.proof) ? resp.proof.slice(0, 4).join(",") : "",
            verification_level: resp.identifier === "proof_of_human" ? "orb" : "device",
          });
        }
      }
    }
  }, [idkit.isSuccess, idkit.result]);

  // Handle error - only once
  useEffect(() => {
    if (idkit.isError && idkit.errorCode && !errorHandledRef.current) {
      errorHandledRef.current = true;
      console.error("[IDKit] Error:", idkit.errorCode);
      onErrorRef.current?.(String(idkit.errorCode));
    }
  }, [idkit.isError, idkit.errorCode]);

  // Debug log - only on meaningful changes
  useEffect(() => {
    console.log("[IDKit] connectorURI:", idkit.connectorURI ? "present" : "null");
    console.log("[IDKit] isInWorldApp:", idkit.isInWorldApp);
  }, [idkit.connectorURI, idkit.isInWorldApp]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => {
        errorHandledRef.current = false;
        successHandledRef.current = false;
        idkit.open();
      }} className="w-full max-w-xs" size="lg">
        <Shield className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>

      {idkit.connectorURI && (
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-white">
          <QrCode className="h-8 w-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">
            World App ile taratın:
          </p>
          <a
            href={idkit.connectorURI}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 underline break-all max-w-[250px]"
          >
            QR Link
          </a>
          {idkit.isAwaitingUserConnection && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Bağlantı bekleniyor...
            </div>
          )}
          {idkit.isAwaitingUserConfirmation && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              World App&apos;te onaylayın...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WorldIdVerifyButton(props: WorldIdVerifyProps) {
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <Button onClick={fetchContext} variant="outline" className="w-full max-w-xs" size="lg">
          Retry
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return <VerifyWithContext rpContext={rpContext} {...props} />;
}
