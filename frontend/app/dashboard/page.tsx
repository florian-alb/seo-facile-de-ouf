"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "./components/skelton";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // Handle OAuth callback
  useEffect(() => {
    const authStatus = searchParams.get("shopify_auth");
    const storeName = searchParams.get("store_name");
    const errorMessage = searchParams.get("message");

    if (authStatus === "success" && storeName) {
      toast.success(`Boutique "${decodeURIComponent(storeName)}" connectée avec succès !`);
      // Clean URL
      window.history.replaceState({}, "", "/dashboard");
    } else if (authStatus === "error") {
      toast.error(`Erreur OAuth: ${errorMessage || "Échec de la connexion"}`);
      // Clean URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  if (loading) return <Skeleton/>

  return (
    <>hello</>
  );
}
