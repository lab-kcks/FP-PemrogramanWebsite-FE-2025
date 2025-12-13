import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: string | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const confidenceScoresRef = useRef<number[]>([]);

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let latestConfidence: number | null = null;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const conf = result[0].confidence;
        
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + " ";
          // Only add valid confidence scores (> 0)
          if (typeof conf === "number" && conf > 0) {
            confidenceScoresRef.current.push(conf);
          }
        } else {
          interimTranscript += result[0].transcript;
          // Track interim confidence
          if (typeof conf === "number" && conf > 0) {
            latestConfidence = conf;
          }
        }
      }

      // Calculate and set confidence
      if (confidenceScoresRef.current.length > 0) {
        // Use average of final confidences
        const avg = confidenceScoresRef.current.reduce((a, b) => a + b, 0) / confidenceScoresRef.current.length;
        setConfidence(Math.round(avg * 100));
      } else if (latestConfidence !== null) {
        // Fall back to interim confidence if no finals yet
        setConfidence(Math.round(latestConfidence * 100));
      }

      // Display final + current interim (no duplication)
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    setError(null);
    setTranscript("");
    setConfidence(null);
    finalTranscriptRef.current = "";
    confidenceScoresRef.current = [];
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.log("Recognition already started");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setConfidence(null);
    finalTranscriptRef.current = "";
    confidenceScoresRef.current = [];
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
};

export default useSpeechRecognition;
