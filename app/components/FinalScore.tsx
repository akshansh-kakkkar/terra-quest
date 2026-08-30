"use client";
type FinalScoreProps = {
    score : number;
    onRestart : ()=>void;
}

function getRating(score : number){
    if(score >= 22000) return "GEOGRAPHY GOD";
    if(score >= 17000) return "IMPRESSIVE";
    if(score >= 12000) return "NOT BAD";
    if(score > 7000) return "YOU TRIED";
    return "MAYBE USE GOOGLE MAPS"
} 

export default function FinalScore({
    score,
    onRestart
} : FinalScoreProps){
    return(
        <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black text-center text-white">
            <p className="text-sm uppercase tracking-widest text-zinc-500">
                Game Over
            </p>
            <h1 className="mt-4 text-6xl font-bold">
                {score.toLocaleString()}
            </h1>
            <p className="mt-2 text-zinc-400">
                total points
            </p>
            <p className="mt-8 text-2xl font-bold">{getRating(score)}</p>
            <button className="mt-10 rounded-xl bg-white px-6 font-semibold text-black transition hover:scale-105 py-4 cursor-pointer" onClick={onRestart}>PLAY AGAIN</button>
        </div>
    )
}