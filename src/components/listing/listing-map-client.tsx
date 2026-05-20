"use client";

import dynamic from "next/dynamic";
import type { MapListing } from "./listing-map";

// ssr: false yalnızca Client Component içinde kullanılabilir
const ListingMap = dynamic(() => import("./listing-map"), { ssr: false });

export default function ListingMapClient({ listings }: { listings: MapListing[] }) {
  return <ListingMap listings={listings} />;
}
