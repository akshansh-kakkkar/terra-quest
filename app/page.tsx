'use client'
import { useState } from "react";
import GameMap from "./components/GameMap";
import { LatLng } from "leaflet";
import { locations } from "./game/locations";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [currentLocation] = useState(
    locations[Math.floor(Math.random() * locations.length)]
  );
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<{distance : number; points : number;} | null>(null);

  return (
    <main className="w-screen h-screen overflow-hidden">
      <GameMap onLocationSelect={setSelectedLocation} selectedLocation={selectedLocation} actualLocation={result ? new LatLng(
        currentLocation.latitude,
        currentLocation.longitude
      ) : null} />
      {selectedLocation && (
        <button onClick={() => {
          const distance = calculateDistance(
            selectedLocation.lat,
            selectedLocation.lng,
            currentLocation.latitude,
            currentLocation.longitude,
          );
          const points = Math.max(
            0,
            Math.round(5000 * Math.exp(-distance / 2000))
          )
          setResult({
            distance,
            points,
          })
        }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] rounded-xl bg-black px-8 py-4 text-lg font-semibold text-white shadow-xl hover:scale-105 transition">
          MAKE GUESS
        </button>
      )}
      {result && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] rounded-xl bg-black px-6 py-4 text-center text-white shadow-xl">
          <p className="text-sm text-zinc-400">
            Distance
          </p>
          <p className="text-3xl font-bold">
            {result.distance.toFixed(1)} km
          </p>
          <p className="mt-2 text-lg">
            {result.points.toLocaleString()} points
          </p>
        </div>
      )}
    </main>
  );
}
