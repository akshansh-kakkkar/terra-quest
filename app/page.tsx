'use client'
import { useState } from "react";
import dynamic from "next/dynamic";
import { LatLng } from "leaflet";
import { locations } from "./game/locations";
import FinalScore from "./components/FinalScore";
import Image from "next/image";
import { Dot } from "lucide-react";

const GameMap = dynamic(
  ()=> import("./components/GameMap"),
  {ssr : false}
)

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
  const [currentLocation, setCurrentLocation] = useState(
    locations[0]
  );
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<{ distance: number; points: number; } | null>(null);
  const [usedLocations, setUsedLocations] = useState<number[]>([0]);
  const nextRound = () => {
    if(round === 5){
      setGameOver(true);
      return;
    }
    const availableLocations = locations
      .map((location, index) => ({ location, index }))
      .filter(({ index }) => !usedLocations.includes(index));
    const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)];
    setCurrentLocation(randomLocation.location);
    setUsedLocations((current)=>[
      ...current,
      randomLocation.index,
    ]);
    setRound((current)=> current + 1);
    setSelectedLocation(null);
    setRevealClues(1)
    setResult(null);
  }
  const [revealClues, setRevealClues] = useState(1);
  return (
    <main className="w-screen h-screen overflow-hidden">
      <GameMap onLocationSelect={setSelectedLocation} selectedLocation={selectedLocation} actualLocation={result ? new LatLng(
        currentLocation.latitude,
        currentLocation.longitude
      ) : null} />
      {selectedLocation && (
        <button
          disabled={!!result}
          onClick={() => {
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
            setScore((current) => current + points);
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
          <button
            onClick={nextRound}
            className="mt-4 rounded-lg cursor-pointer bg-white px-5 py-2 font-semibold text-black hover:scale-105 transition"
          >NEXT ROUND
          </button>
        </div>
      )}
      <div className="absolute top-5 right-10 z-[1000] rounded-lg bg-black px-4 py-2 text-white">
        Round {round}/5
      </div>
      <div className="absolute top-5 left-10 z-[1000] rounded-lg bg-black text-white py-2 px-4 ">
        Score : {score.toLocaleString()}
      </div>
      {gameOver && (
        <FinalScore score={score} onRestart={()=>{
          window.location.reload();
        }} />
      )}
      <div className="absolute top-6 left-6 z-[1000] w-[450px] overflow-hidden rounded-2xl bg-black shadow-2xl">
        <Image src={currentLocation.image} alt="location" width={450} height={300} className="h-[300px] w-full object-cover" />
            <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Clues</p>
        <div className="mt-3 space-y-2">
          {currentLocation.clues.map((clue, index)=>(
            <div  key={index}>
              {index < revealClues ? (
            <p className="text-sm flex text-white">
             <span><Dot /> </span> 
             <span>{clue}</span>
            </p>
              ) : (
                <button className="text-sm text-zinc-500 hover:text-white transition-all" onClick={()=>setRevealClues((current)=> current + 1)}>
                  Reveal clue #{index + 1}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>

    </main>
  );
}
