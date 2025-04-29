"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { RedoIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";


async function writeToDatabase(randomNumber: number, toast: any) {
  try {
    const docRef = await addDoc(collection(db, "randomNumbers"), {
      number: randomNumber,
      timestamp: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef?.id);
    toast({
      title: "Number saved!",
      description: `Number ${randomNumber} saved to database. :)`,
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

async function writeHelloWorld(toast: any) {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      message: "Hello World",
      timestamp: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    toast && toast({
      title: "Message saved!",
      description: `Message "Hello World" saved to database.`,
    });
  } catch (e: any) {
    console.error("Error adding document: ", e);
    toast({
      variant: "destructive",
      title: "Error saving message",
      description: e.message,
    });
  }
}

function NumberGenerator({ onNumberGenerated }: { onNumberGenerated: (number: number) => void }) {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const { toast } = useToast();

  const generateRandomNumber = () => {
    // Secure random number generation
    const newRandomNumber = Math.floor(Math.random() * 1000); // Adjust range as needed
    setRandomNumber(newRandomNumber);
    onNumberGenerated(newRandomNumber);
  };

  const handleSaveToDatabase = () => {
    if (randomNumber !== null) {
      writeToDatabase(randomNumber, toast);
    } else {
      toast({
        title: "Error",
        description: "No number generated",
      });
    }
  };

  return (
    <Card className="w-full max-w-md fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Random Number Generator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="text-5xl font-bold">{randomNumber !== null ? randomNumber : "Generate a number"}</div>
        <div className="flex space-x-4">
          <Button onClick={generateRandomNumber}>
            Generate
          </Button>
          <Button onClick={handleSaveToDatabase}>
            Save to Database
          </Button>
        </div>
        <div className="flex space-x-4">
          <Button onClick={() => writeHelloWorld(toast)} variant="secondary">
            Write Hello World
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SavedNumbersList() {
  const [savedNumbers, setSavedNumbers] = useState<
    { number: number; timestamp: any }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNumbers();
  }, []);


  const loadNumbers = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "randomNumbers"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const numbers: { number: number; timestamp: any }[] = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        numbers.push({
          number: doc.data().number,
          timestamp: doc.data().timestamp,
        });
      });
      setSavedNumbers(numbers);
    } catch (e: any) {
      console.error("Error loading numbers: ", e);
      toast({
        variant: "destructive",
        title: "Error loading numbers",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mt-4 fade-in">
      <CardHeader>
        <CardTitle>Saved Numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={loadNumbers} disabled={isLoading}>
          {isLoading ? (
            <RedoIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Refresh Numbers"
          )}
        </Button>
        <ScrollArea className="h-[200px] w-full">
          <ul className="list-none p-0">
            {savedNumbers.map((item, index) => (
              <li key={index} className="py-2 border-b last:border-b-0">
                {item.number} - {item.timestamp?.toDate().toLocaleString()}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


export default function Home() {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [activeView, setActiveView] = useState("generator");

  const handleNumberGenerated = (number: number) => {
    setCurrentNumber(number);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <CardTitle className="text-lg">RandoDB</CardTitle>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuButton onClick={() => setActiveView("generator")}>
                Generate Number
              </SidebarMenuButton>
              <SidebarMenuButton onClick={() => setActiveView("list")}>
                List Saved Numbers
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <Toaster />
        {activeView === "generator" ? (
          <NumberGenerator onNumberGenerated={handleNumberGenerated} />
        ) : (
          <SavedNumbersList />
        )}
      </main>
    </SidebarProvider>
  );
}
