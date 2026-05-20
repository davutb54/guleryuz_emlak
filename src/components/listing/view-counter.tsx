"use client";

import { useEffect, useRef } from "react";
import { incrementViewCount } from "@/lib/actions/view-count";

interface Props {
  listingId: string;
}

export default function ViewCounter({ listingId }: Props) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    incrementViewCount(listingId);
  }, [listingId]);

  return null;
}
