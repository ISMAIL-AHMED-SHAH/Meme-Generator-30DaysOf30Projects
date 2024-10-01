"use client";

import { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClipLoader from "react-spinners/ClipLoader";
import React from "react";

// Define the Meme type
type Meme = {
  id: string;
  name: string;
  url: string;
};

// Define the Position type
type Position = {
  x: number;
  y: number;
};

export default function MemeGenerator() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [visibleMemes, setVisibleMemes] = useState<Meme[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [text, setText] = useState<string>("");
  const [textPosition, setTextPosition] = useState<Position>({ x: 0, y: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [moreLoading, setMoreLoading] = useState<boolean>(false);
  const memeRef = useRef<HTMLDivElement>(null);
  const memesPerLoad = 4;

  // useEffect to fetch memes from the API when the component mounts
  useEffect(() => {
    const fetchMemes = async () => {
      setLoading(true);
      const response = await fetch("https://api.imgflip.com/get_memes");
      const data = await response.json();
      setMemes(data.data.memes);
      setVisibleMemes(data.data.memes.slice(0, memesPerLoad));
      setLoading(false);
    };
    fetchMemes();
  }, []);

  // Function to load more memes into the carousel
  const loadMoreMemes = (): void => {
    setMoreLoading(true);
    const newVisibleMemes = memes.slice(0, visibleMemes.length + memesPerLoad);
    setVisibleMemes(newVisibleMemes);
    setMoreLoading(false);
  };

  // Function to handle downloading the meme as an image
  const handleDownload = async (): Promise<void> => {
    if (memeRef.current) {
      const canvas = await html2canvas(memeRef.current);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "meme.png";
      link.click();
    }
  };

  // JSX return statement rendering the Meme Generator UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl p-6 rounded-lg shadow-2xl bg-gray-800 border border-gray-700 transition-all hover:border-blue-500 hover:shadow-blue-500/50">
        {/* Header section */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Meme Generator
          </h1>
          <p className="text-gray-400">
            Create custom memes with our easy-to-use generator.
          </p>
        </div>
        {/* Loading spinner or meme carousel */}
        {loading ? (
          <ClipLoader className="w-12 h-12 text-blue-500" />
        ) : (
          <>
            {/* Meme carousel */}
            <div className="w-full overflow-x-scroll whitespace-nowrap py-2">
              {visibleMemes.map((meme) => (
                <Card
                  key={meme.id}
                  className="inline-block bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 mx-2"
                  onClick={() => setSelectedMeme(meme)}
                >
                  <Image
                    src={meme.url}
                    alt={meme.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                  <CardContent>
                    <p className="text-center text-white">{meme.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Load more memes button */}
            {visibleMemes.length < memes.length && (
              <Button
                onClick={loadMoreMemes}
                className="mt-4 bg-blue-600 hover:bg-blue-500 transition-colors"
                disabled={moreLoading}
              >
                {moreLoading ? (
                  <ClipLoader className="w-6 h-6 text-white" />
                ) : (
                  "Load More"
                )}
              </Button>
            )}
          </>
        )}
        {/* Meme customization section */}
        {selectedMeme && (
          <Card className="mt-8 w-full max-w-md bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Customize Your Meme</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={memeRef}
                className="relative bg-gray-700 rounded-lg overflow-hidden"
              >
                <Image
                  src={selectedMeme.url}
                  alt={selectedMeme.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
                <Draggable
                  position={textPosition}
                  onStop={(_, data) => {
                    setTextPosition({ x: data.x, y: data.y });
                  }}
                >
                  <div
                    className="absolute text-white text-xl font-bold"
                    style={{ left: textPosition.x, top: textPosition.y }}
                  >
                    {text}
                  </div>
                </Draggable>
              </div>
              <div className="mt-4">
                {/* Text input for adding meme text */}
                <Label htmlFor="meme-text" className="text-white">Add your text</Label>
                <Textarea
                  id="meme-text"
                  placeholder="Enter your meme text"
                  className="mt-1 w-full bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 transition-colors" onClick={handleDownload}>
                Download Meme
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Footer section */}
      <footer className="mt-4 text-sm text-muted-foreground">
        Created By Ismail Ahmed Shah
      </footer>
    </div>
  );
}
