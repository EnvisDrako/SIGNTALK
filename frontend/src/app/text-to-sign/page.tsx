"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";

function SignAvatar({ currentAnimation }: { currentAnimation: string | null }) {
    // In a real implementation, this would load a GLTF model and applying Slerp blending
    // based on the currentAnimation URL. Here we mock it with a basic shape indicating state.
    return (
        <group position={[0, -1, 0]}>
            <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color={currentAnimation ? "#10b981" : "#818cf8"} roughness={0.3} metalness={0.8} />
            </mesh>
            <ContactShadows opacity={0.6} scale={10} blur={2} far={4} color="#000000" />
        </group>
    );
}

export default function TextToSign() {
    const [inputText, setInputText] = useState("");
    const [playlist, setPlaylist] = useState<any[]>([]);
    const [playingIndex, setPlayingIndex] = useState(-1);

    const handleTranslate = async () => {
        try {
            // Call FastAPI backend to convert text to ASL gloss + animation playlist
            const res = await fetch("http://localhost:8000/api/text-to-sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText }),
            });
            const data = await res.json();
            setPlaylist(data.playlist);

            // Start playback sequence simulating animation blending durations
            if (data.playlist.length > 0) {
                setPlayingIndex(0);
                playSequence(data.playlist, 0);
            }
        } catch (err) {
            console.error("Backend offline. Please start the FastAPI server.");
        }
    };

    const playSequence = (list: any[], index: number) => {
        if (index >= list.length) {
            setPlayingIndex(-1);
            return;
        }
        setPlayingIndex(index);
        setTimeout(() => {
            playSequence(list, index + 1);
        }, list[index].durationMs);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-white font-sans">
            {/* Left Panel: NLP Input & Stats */}
            <div className="md:w-1/3 p-8 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl">
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Text-to-Sign</h1>
                <p className="text-slate-400 mb-8 max-w-sm leading-relaxed text-sm">
                    Convert English into 3D sign language animations utilizing the T5 NLP Gloss translation pipeline.
                </p>

                <textarea
                    className="w-full h-32 p-4 bg-slate-950 border border-slate-800 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder-slate-600 mb-6 shadow-inner"
                    placeholder="Enter a sentence in English..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />

                <button
                    onClick={handleTranslate}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] outline-none"
                >
                    Translate to ASL Animation
                </button>

                {playlist.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Translation Pipeline</h3>
                        <ul className="space-y-3">
                            {playlist.map((item, idx) => (
                                <li
                                    key={idx}
                                    className={`p-4 rounded-xl text-sm font-mono border transition-all duration-300 ${idx === playingIndex ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-200 scale-105 shadow-md shadow-indigo-500/10' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}
                                >
                                    <span className="font-bold mr-2 text-slate-400">GLOSS:</span> {item.gloss}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Panel: 3D Visualization */}
            <div className="md:w-2/3 h-[50vh] md:h-screen relative bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20">
                <div className="absolute top-8 right-8 z-10 p-4 bg-slate-950/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl pointer-events-none transition-all">
                    {playingIndex !== -1 ? (
                        <p className="text-xs uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-3">
                            <span className="block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_theme(colors.emerald.400)] animate-pulse"></span>
                            Playing: {playlist[playingIndex].gloss}
                        </p>
                    ) : (
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-3">
                            <span className="block w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                            Avatar Idle
                        </p>
                    )}
                </div>

                <Canvas shadows camera={{ position: [0, 2, 6], fov: 40 }}>
                    <ambientLight intensity={0.4} />
                    <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
                    <Environment preset="studio" />
                    <SignAvatar currentAnimation={playingIndex !== -1 ? playlist[playingIndex].animationUrl : null} />
                    <OrbitControls
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.5}
                        minDistance={3}
                        maxDistance={10}
                        autoRotate={playingIndex === -1}
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            </div>
        </div>
    );
}
