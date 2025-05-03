"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Command {
  command: string;
  description: string;
  action: () => void;
}

interface SpeechNavigationProps {
  onSelectTab: (tab: string) => void;
  onSelectCountry: (country: string) => void;
  onSelectRegion: (region: string | null) => void;
  onExport: (type: "csv" | "pdf") => void;
  availableCountries: string[];
  availableRegions: string[];
}

export function SpeechNavigation({
  onSelectTab,
  onSelectCountry,
  onSelectRegion,
  onExport,
  availableCountries,
  availableRegions,
}: SpeechNavigationProps) {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [transcript, setTranscript] = useState("");
  const [commands, setCommands] = useState<Command[]>([]);
  const { toast } = useToast();

  // Setup speech recognition when component mounts
  useEffect(() => {
    if (
      (typeof window !== "undefined" && "SpeechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      // Browser supports speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => {
        setListening(true);
        toast({
          title: "Voice Navigation Active",
          description: "Listening for commands...",
        });
      };

      recognitionInstance.onend = () => {
        setListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setListening(false);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Try again.`,
          variant: "destructive",
        });
      };

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript
          .toLowerCase()
          .trim();
        setTranscript(result);
        processCommand(result);
      };

      setRecognition(recognitionInstance);
    }

    // Define available commands
    const commandList: Command[] = [
      {
        command: "show countries",
        description: "Switch to country comparison view",
        action: () => onSelectTab("countries"),
      },
      {
        command: "show trends",
        description: "Switch to trend analysis view",
        action: () => onSelectTab("trends"),
      },
      {
        command: "show table",
        description: "Show the data table",
        action: () => onSelectTab("table"),
      },
      {
        command: "show regions",
        description: "Show regional analysis",
        action: () => onSelectTab("regions"),
      },
      {
        command: "export CSV",
        description: "Export data to CSV",
        action: () => onExport("csv"),
      },
      {
        command: "export PDF",
        description: "Export data to PDF",
        action: () => onExport("pdf"),
      },
      {
        command: "global view",
        description: "Show global data",
        action: () => onSelectRegion(null),
      },
    ];

    // Add region commands
    availableRegions.forEach((region) => {
      commandList.push({
        command: `show ${region.toLowerCase()}`,
        description: `Filter data for ${region}`,
        action: () => onSelectRegion(region),
      });
    });

    // Add top country commands
    const topCountries = availableCountries.slice(0, 20); // Limit to top 20 to avoid too many commands
    topCountries.forEach((country) => {
      commandList.push({
        command: `select ${country.toLowerCase()}`,
        description: `Select ${country}`,
        action: () => onSelectCountry(country),
      });
    });

    setCommands(commandList);

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [
    onSelectTab,
    onSelectCountry,
    onSelectRegion,
    onExport,
    availableCountries,
    availableRegions,
    toast,
  ]);

  const toggleListening = () => {
    if (listening) {
      recognition?.stop();
      setListening(false);
    } else {
      try {
        recognition?.start();
      } catch (error) {
        console.error("Speech recognition error:", error);
        toast({
          title: "Voice Recognition Error",
          description:
            "Could not start voice recognition. Make sure your browser supports this feature and you've granted microphone permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const processCommand = (text: string) => {
    // Check if the spoken text matches any command
    for (const command of commands) {
      if (text.includes(command.command.toLowerCase())) {
        toast({
          title: `Command: ${command.command}`,
          description: command.description,
        });
        command.action();
        return;
      }
    }

    // If no exact match, try to find a close match for countries
    if (text.includes("select") || text.includes("show")) {
      const words = text.split(" ");
      for (const country of availableCountries) {
        // Try to match country names that might be pronounced differently
        const countryLower = country.toLowerCase();
        const matchScore = words.some(
          (word) =>
            countryLower.includes(word) ||
            (word.length > 4 &&
              countryLower.includes(word.substring(0, word.length - 1))),
        );

        if (matchScore && (text.includes("select") || text.includes("show"))) {
          toast({
            title: `Selected ${country}`,
            description: `Showing data for ${country}`,
          });
          onSelectCountry(country);
          return;
        }
      }
    }

    // No command matched
    toast({
      title: "Command not recognized",
      description: `Try saying "show countries" or "select United States"`,
    });
  };

  // Check if browser supports speech recognition
  if (
    typeof window !== "undefined" &&
    !("SpeechRecognition" in window) &&
    !("webkitSpeechRecognition" in window)
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Navigation</CardTitle>
          <CardDescription>
            Voice commands are not supported in your browser. Try Chrome, Edge,
            or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Navigation</CardTitle>
        <CardDescription>
          Control the dashboard with voice commands
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={toggleListening}
          variant={listening ? "destructive" : "default"}
          className="w-full"
        >
          {listening ? "Stop Listening" : "Start Voice Commands"}
        </Button>

        {listening && (
          <div className="text-sm">
            <p className="font-medium text-green-600 animate-pulse">
              Listening...
            </p>
            {transcript && (
              <p className="text-muted-foreground">Heard: "{transcript}"</p>
            )}
          </div>
        )}

        <div className="text-xs space-y-1">
          <p className="font-medium">Try saying:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>"Show countries"</li>
            <li>"Show regions"</li>
            <li>"Select United States"</li>
            <li>"Export CSV"</li>
            <li>"Global view"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Add TypeScript interfaces for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  onstart: () => void;
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}
