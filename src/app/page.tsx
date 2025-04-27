"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Toaster } from "@/components/ui/toaster";

async function writeToDatabase(randomNumber: number) {
  try {
    const docRef = await addDoc(collection(db, "randomNumbers"), {
      number: randomNumber,
      timestamp: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    toast({
      title: "Number saved!",
      description: `Number ${randomNumber} saved to database.`,
    });
  } catch (e: any) {
    console.error("Error adding document: ", e);
    toast({
      variant: "destructive",
      title: "Error saving number",
      description: e.message,
    });
  }
}

import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateRandomNumber(); // Generate a number on initial load
  }, []);

  const generateRandomNumber = () => {
    // Secure random number generation
    const newRandomNumber = Math.floor(Math.random() * 1000); // Adjust range as needed
    setRandomNumber(newRandomNumber);
  };

  const handleSaveToDatabase = () => {
    if (randomNumber !== null) {
      writeToDatabase(randomNumber);
    } else {
      toast({
        title: "Error",
        description: "No number generated",
      });
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <Toaster />
      <Card className="w-full max-w-md fade-in">
        <CardHeader>
          <CardTitle className="text-2xl text-center">RandoDB</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="text-5xl font-bold">{randomNumber !== null ? randomNumber : "Generate a number"}</div>
          <div className="flex space-x-4">
            <Button onClick={generateRandomNumber} variant="accent">
              Generate
            </Button>
            <Button onClick={handleSaveToDatabase} variant="primary">
              Save to Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

