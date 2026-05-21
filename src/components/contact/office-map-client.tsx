"use client";

import dynamic from "next/dynamic";

const OfficeMap = dynamic(() => import("./office-map"), { ssr: false });

export default function OfficeMapClient({
  lat,
  lng,
  address,
}: {
  lat?: number;
  lng?: number;
  address?: string;
}) {
  return <OfficeMap lat={lat} lng={lng} address={address} />;
}
