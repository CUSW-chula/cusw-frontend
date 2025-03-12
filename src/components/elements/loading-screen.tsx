"use client";

import { useState, useEffect } from "react";

const images = [
  "/asset/loading/Property 1=Default.svg",
  "/asset/loading/Property 1=Variant2.svg",
  "/asset/loading/Property 1=Variant3.svg",
  "/asset/loading/Property 1=Variant4.svg",
  "/asset/loading/Property 1=Variant5.png",
];

const loadingText = "Loading...";
const textSequence = [
  "Loading...",
  "LOading...",
  "LOAding...",
  "LOADing...",
  "LOADIng...",
  "LOADINg...",
  "LOADING...",
  "Loading...", // รีเซ็ต
];

export default function LoadingClient() {
  const [currentImage, setCurrentImage] = useState(0);
  const [currentText, setCurrentText] = useState(textSequence[0]);

  // Image rotation effect
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 1000);

    return () => clearInterval(imageInterval);
  }, []);

  // Text transformation effect
  useEffect(() => {
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      setCurrentText(textSequence[currentIndex]);
      currentIndex = (currentIndex + 1) % textSequence.length; // วนลูปตามลำดับ
    }, 1000);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={images[currentImage]}
        alt="Loading animation"
        width={300}
        height={0}
      />
      <p className="text-base font-BaiJamjuree">{currentText}</p>
    </div>
  );
}