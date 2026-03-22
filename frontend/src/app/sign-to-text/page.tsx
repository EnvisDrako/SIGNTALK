"use client";

import { useEffect, useRef, useState } from "react";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";

export default function SignToText() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [translation, setTranslation] = useState("");
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // 1. Initialize WebSocket to FastAPI backend
        wsRef.current = new WebSocket("ws://localhost:8000/ws/sign-to-text");
        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setTranslation(data.text);
        };

        // 2. Initialize MediaPipe Holistic
        const holistic = new Holistic({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });

        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        holistic.onResults((results) => {
            // 3. Stream extracted coordinates to FastAPI backend
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    face: results.faceLandmarks || [],
                    pose: results.poseLandmarks || [],
                    leftHand: results.leftHandLandmarks || [],
                    rightHand: results.rightHandLandmarks || []
                }));
            }
        });

        // 4. Start Webcam Capture
        if (videoRef.current) {
            const camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (videoRef.current) {
                        await holistic.send({ image: videoRef.current });
                    }
                },
                width: 640,
                height: 480,
            });
            camera.start();
        }

        return () => {
            wsRef.current?.close();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-950 text-white">
            <h1 className="text-4xl font-extrabold mb-8 tracking-tight">SignTalk: Sign-to-Text</h1>
            <div className="relative w-[640px] h-[480px] bg-black rounded-lg overflow-hidden border-2 border-slate-800 shadow-2xl shadow-indigo-500/10">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline />
            </div>
            <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl text-center shadow-xl">
                <h2 className="text-xs uppercase text-slate-400 font-bold mb-3 tracking-widest">Live Translation output</h2>
                <p className="text-2xl font-medium text-emerald-400">
                    {translation || "Waiting for signs..."}
                </p>
            </div>
        </div>
    );
}
