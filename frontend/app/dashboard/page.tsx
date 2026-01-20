"use client"

import { useState } from "react";
import { Skeleton } from "./components/skelton";

export default function Page() {
  const [loading, setLoading] = useState(true)

  if (loading) return <Skeleton/>

  return (
    <>hello</>
  );
}
