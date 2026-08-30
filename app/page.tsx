'use client'
import { useState } from "react";
import GameMap from "./components/GameMap";
import { LatLng } from "leaflet";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  return (
    <main className="w-screen h-screen overflow-hidden">
      <GameMap onLocationSelect={setSelectedLocation}  selectedLocation={selectedLocation}/>
      {selectedLocation && (
        <div className="absolute bottom-5 left-5 z-[1000] rounded-lg bg-white text-black">
          {selectedLocation.lat.toFixed(4)},{" "}
          {selectedLocation.lng.toFixed(4)}
        </div>
      )}
    </main>
  );
}
