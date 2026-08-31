'use client'
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLng } from "leaflet";
import { locations } from "./game/locations";
import FinalScore from "./components/FinalScore";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUp, CircleSmall, Dot, Minus, Plus } from "lucide-react";
import { AnimatePresence, distance, motion } from "framer-motion";
import { head } from "framer-motion/client";

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
  const [result, setResult] = useState<{ distance: number; rating: string; points: number; timedOut?: boolean; timeBonus: number; perfectBonus: number; } | null>(null);
  const [usedLocations, setUsedLocations] = useState<number[]>([0]);
  const [isTransitioning, setIsTransitioning] = useState(false);


  const nextRound = () => {
    if (round === 5) {
      setGameOver(true);
      return;
    }
    setIsTransitioning(true);
    setTimeout(() => {

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
      setTimeLeft(30);
      setImageScale(1);
      setIsTransitioning(false);
    }, 400)

  }

  const [revealClues, setRevealClues] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [heading, setHeading] = useState(0);
  useEffect(() => {
    if (result || gameOver) return;
    if (timeLeft === 0) {
      setResult({
        distance: Infinity,
        points: 0,
        timedOut: true,
        timeBonus: 0,
        perfectBonus: 0,
        rating: ""
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result, gameOver])
  return (
    <main className="w-screen h-screen overflow-hidden">
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] flex items-center justify-center bg-black">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm uppercase tracking-[0.3em] text-white">
              Next location...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
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
              const basePoints = Math.max(0, Math.round(5000 * Math.exp(-distance / 2000)));
              const timeBonus = Math.round(timeLeft * 10);
              const perfectBonus = distance <= 25 ? 1000 : 0;
              const points = basePoints + timeBonus + perfectBonus;
              let rating = "WAY OFF";
              if (distance <= 25) {
                rating = "PERFECT";
              }
              else if (distance <= 100) {
                rating = "GREAT"
              }
              else if (distance <= 500) {
                rating = "GOOD"
              }
              else if (distance <= 1500) {
                rating = "CLOSE ENOUGH"
              }

              setResult({
                distance,
                points,
                timeBonus,
                perfectBonus,
                rating,
              })
              setScore((current) => current + points);
            }}>
            MAKE GUESS
          </button>

        </div>
      )}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut", }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] rounded-xl bg-black px-6 py-4 text-center text-white shadow-xl">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm font-bold uppercase tracking-widest text-white">
            {result.rating}
          </motion.p>
          {result.timedOut ? (
            <>
              <p className="text-xs uppercase tracking-widest text-red-400">
                Time's Up
              </p>
              <p className="mt-1 text-3xl font-bold">
                0 points
              </p>

              <p className="text-md font-bold text-white">{currentLocation.name}, {currentLocation.country}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-400">
                Distance
              </p>
              <p className="text-3xl font-bold">
                {result.distance.toFixed(1)} km
              </p>
              <p className="mt-2 text-lg">
                {result.points.toLocaleString()} points
              </p>
              {result.timeBonus > 0 && (
                <p className="mt-1 text-sm font-semibold text-yellow-400">+{result.timeBonus} SPEED BONUS</p>
              )}
              {result.perfectBonus > 0 && (
                <p className="mt-1 font-semibold text-sm text-yellow-400">
                  +{result.perfectBonus} PERFECT BONUS
                </p>
              )}
              <p className="text-md font-bold text-white">{currentLocation.name}, {currentLocation.country}</p>
            </>
          )}

          <button
            onClick={nextRound}
            className="mt-4 rounded-lg cursor-pointer bg-white px-5 py-2 font-semibold text-black hover:scale-105 transition"
          >
            {round === 5 ? "SEE RESULTS" : "NEXT ROUND"}
          </button>
        </motion.div>
      )}
      <div className="absolute top-5 right-10 z-[1000] rounded-lg bg-black px-4 py-2 text-white">
        Round {round}/5
        <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${(round / 5) * 100}%` }}
          />
        </div>
      </div>
      <motion.div
        key={score}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.35 }}
        className="absolute top-5 left-12 z-[1000] flex gap-2 items-center text-center justify-center rounded-lg bg-black text-white py-2 px-4 ">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Score</p>
        <p className="text-xl font-bold">{score.toLocaleString()}</p>
        <AnimatePresence>
          {scoreChange !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: -10 }}
              exit={{ opacity: 0 }}
              className="absolute top-16 left-12 z-[1000] text-sm font-bold text-red-400"
            >
              {scoreChange}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className={`absolute top-7 left-1/2 z-[650] -translate-x-1/2 rounded-xl bg-black px-5 py-2 text-white shadow-lg ${timeLeft <= 10 ? "animate-bounce bg-red-600" : timeLeft <= 20 ? "bg-orange-500" : "bg-black"} ${timeLeft === 0 && "hidden"}`}>
        <span className="text-xs uppercase tracking-widest text-shadow-initial opacity-70">Time</span>
        <span className="ml-3 text-xs font-bold">{timeLeft}s</span>
      </div>
      {gameOver && (
        <FinalScore score={score} onRestart={() => {
          window.location.reload();
        }} />
      )}
      <div className="absolute bottom-5 right-2 z-[1000] w-[350px] overflow-hidden rounded-2xl bg-black shadow-2xl">
        <div className="relative w-full overflow-hidden h-[150px]">
          <motion.div
            animate={{ rotate: -heading }}
            transition={{ duration: 0.25 }}
            className="absolute top-5 flex left-1/2 z-10 h-12 w-12 items-center gap-2 -translate-x-1/2 rounded-full bg-black/80 p-2 text-xs font-medium text-white backdrop-blur-sm">
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white">
              N
            </span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white ">
              E
            </span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white">
              S
            </span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white ">
              W
            </span>
            <ArrowUp
              size={13}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </motion.div>
          <motion.div
            key={heading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-[68px] flex gap-1 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black px-2 py-0.5 text-[9px] text-white text-white">
            {heading} 
            <span>
              <CircleSmall size={6} />
              </span>
          </motion.div>
          <div className="absolute bottom-3 text-white left-3 z-20  rounded-lg  bg-black/80 px-3 py-2 text-xs uppercase tracking-widest backdrop-blur-sm">
            Explore
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLocation.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full">
              <Image
                src={currentLocation.image}
                alt="location"
                width={300}
                height={150}
                className="h-full w-[200%] max-w-none object-cover absolute "
                style={{ transform: `translateX(calc(-50% + ${-heading / 2}px)) scale(${imageScale})`,
                  transition : "transform 0.3s ease"
                 }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          className="rounded-lg bg-black/80 px-3 py-2 text-white"
          onClick={() => setHeading((current) => (current + 15) % 360)}
        ><ArrowLeft />
        </button>
        <div className="absolute bottom-3 right-3 flex gap-2 z-20">
          <button className="rounded-lg bg-black/80 px-3 py-2 text-white" onClick={() => setImageScale((current) => Math.min(current + 0.25, 2.5))}>
            <Plus />
          </button>
          <button className="rounded-lg bg-black/80 px-3 py-2 text-white " onClick={() => setImageScale((current) => Math.max(current - 0.25, 1))}>
            <Minus />
          </button>
        </div>
        <button className="rounded-lg bg-black/80 px-3 py-2 text-white"
          onClick={() => setHeading((current) => (current - 15 + 360) % 360)}>
          <ArrowRight />
        </button>
        <div className="p-4 z-[100000]">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Clues</p>
          <div className="mt-3 space-y-2">
            {currentLocation.clues.map((clue, index) => (
              <div key={index}>
                {index < revealClues ? (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-sm flex text-white">
                    <span><Dot /> </span>
                    <span>{clue}</span>
                  </motion.p>
                ) : index === revealClues ? (
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-sm text-zinc-500 hover:text-white transition-all" onClick={() => {
                      const cost = index === 1 ? 250 : 500;
                      setScore((current) => Math.max(0, current - cost));
                      setScoreChange(-cost);
                      setTimeout(() => {
                        setScoreChange(null);
                      })
                      setRevealClues((current) => current + 1);
                    }}>
                    Reveal clue #{index + 1} (-{index === 1 ? 250 : 500})
                  </motion.button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}