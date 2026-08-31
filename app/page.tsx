'use client'
import { useState } from "react";
import dynamic from "next/dynamic";
import { LatLng } from "leaflet";
import { locations } from "./game/locations";
import FinalScore from "./components/FinalScore";
import Image from "next/image";
import { ArrowUp, Dot, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const GameMap = dynamic(
  () => import("./components/GameMap"),
  { ssr: false }
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
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; } | null>(null);
  const [currentLocation, setCurrentLocation] = useState(
    locations[0]
  );
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<{ distance: number; points: number; } | null>(null);
  const [usedLocations, setUsedLocations] = useState<number[]>([0]);
  const nextRound = () => {
    if (round === 5) {
      setGameOver(true);
      return;
    }
    const availableLocations = locations
      .map((location, index) => ({ location, index }))
      .filter(({ index }) => !usedLocations.includes(index));
    const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)];
    setCurrentLocation(randomLocation.location);
    setUsedLocations((current) => [
      ...current,
      randomLocation.index,
    ]);
    setRound((current) => current + 1);
    setSelectedLocation(null);
    setRevealClues(1)
    setResult(null);
    setImageScale(1);
  }
  const [revealClues, setRevealClues] = useState(1);
  const [imageScale, setImageScale] = useState(1);
  return (
    <main className="w-screen h-screen overflow-hidden">
      <GameMap distance={result?.distance ?? null} onLocationSelect={setSelectedLocation} selectedLocation={selectedLocation} actualLocation={result ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null}
        resultShown={!!result} />
      {selectedLocation && !result && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] rounded-xl bg-black px-8 py-4 text-lg font-semibold text-white shadow-xl hover:scale-105 transition">

          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Your Guess
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            {selectedLocation.lat.toFixed(2)}, {" "}
            {selectedLocation.lng.toFixed(2)}
          </p>
          <button
            className="mt-3 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:scale-105"
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
            }}>
            MAKE GUESS
          </button>
        </div>
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
          >
            {round === 5 ? "SEE RESULTS" : "NEXT ROUND"}
          </button>
        </div>
      )}
      <div className="absolute top-5 right-10 z-[1000] rounded-lg bg-black px-4 py-2 text-white">
        Round {round}/5
      </div>
      <div className="absolute top-5 left-12 z-[1000] rounded-lg bg-black text-white py-2 px-4 ">
        Score : {score.toLocaleString()}
      </div>
      {gameOver && (
        <FinalScore score={score} onRestart={() => {
          window.location.reload();
        }} />
      )}
      <div className="absolute bottom-5 right-2 z-[1000] w-[450px] overflow-hidden rounded-2xl bg-black shadow-2xl">
        <div className="relative w-full overflow-hidden h-[250px]">
          <div className="absolute top-5 flex left-1/2 z-10 items-center gap-2 -translate-x-1/2 rounded-full bg-black/80 p-2 text-xs font-medium text-white backdrop-blur-sm">
            N <ArrowUp size={12} />
          </div>
          <div className="absolute bottom-3 text-white left-3 z-20  rounded-lg  bg-black/80 px-3 py-2 text-xs uppercase tracking-widest backdrop-blur-sm">
            Explore
          </div>
          <AnimatePresence mode="wait">
            <motion.div
            key={currentLocation.id}
            initial={{opacity : 0, scale : 1.05}}
            animate={{opacity : 1, scale : 1}}
            exit={{opacity : 0, scale : 0.98}}
            transition={{duration : 0.4}}
            className="w-full h-full">
          <Image
            src={currentLocation.image}
            alt="location"
            width={450}
            height={300}
            className="h-full w-full object-cover"
            style={{ transform: `scale(${imageScale})` }}
          />
          </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-2 z-20">
          <button className="rounded-lg bg-black/80 px-3 py-2 text-white" onClick={() => setImageScale((current) => Math.min(current + 0.25, 2.5))}>
            <Plus />
          </button>
          <button className="rounded-lg bg-black/80 px-3 py-2 text-white " onClick={() => setImageScale((current) => Math.max(current - 0.25, 1))}>
            <Minus />
          </button>
        </div>
        <div className="p-4 z-[100000]">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Clues</p>
          <div className="mt-3 space-y-2">
            {currentLocation.clues.map((clue, index) => (
              <div key={index}>
                {index < revealClues ? (
                  <p className="text-sm flex text-white">
                    <span><Dot /> </span>
                    <span>{clue}</span>
                  </p>
                ) : index === revealClues ? (
                  <button className="text-sm text-zinc-500 hover:text-white transition-all" onClick={() => {
                    const cost = index === 1 ? 250 : 500;
                    setScore((current) => Math.max(0, current - cost));
                    setRevealClues((current) => current + 1);
                  }}>
                    Reveal clue #{index + 1} (-{index === 1 ? 250 : 500})
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}
