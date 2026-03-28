import { useEffect, useRef, useState } from "react";

export default function useTranscription(onFinalCommit, opts = {}) {
  const recognitionRef = useRef(null);
  const manuallyStoppedRef = useRef(true);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = opts.lang || "en-US";

    rec.onstart = () => {
      setPermissionError("");
      setIsListening(true);
    };

    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const text = r[0]?.transcript || "";
        if (r.isFinal) {
          setInterimText("");
          const cleaned = text.trim();
          if (cleaned) onFinalCommit(cleaned);
        } else {
          setInterimText(text);
        }
      }
    };

    rec.onerror = (e) => {
      const code = e?.error || "speech-error";
      let mapped = "speech-error";
      if (code === "not-allowed" || code === "service-not-allowed") mapped = "permission-denied";
      else if (code === "no-speech") mapped = "no-speech";
      else if (code === "audio-capture") mapped = "no-mic";
      setPermissionError(mapped);
      if (mapped === "permission-denied" || mapped === "no-mic") {
        setIsListening(false);
        manuallyStoppedRef.current = true;
      } else {
        // transient error: try to keep listening
        setIsListening(true);
      }
    };

    rec.onend = () => {
      // Auto-restart if user didn't manually stop and we're allowed
      if (
        !manuallyStoppedRef.current &&
        permissionError !== "permission-denied" &&
        permissionError !== "no-mic"
      ) {
        try {
          recognitionRef.current && recognitionRef.current.start();
          setIsListening(true);
        } catch {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    return () => {
      try {
        recognitionRef.current && recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, []);

  const start = async () => {
    try {
      // Prompt mic permission explicitly to surface UI
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setPermissionError("");
       manuallyStoppedRef.current = false;
      recognitionRef.current && recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setPermissionError("permission-denied");
      setIsListening(false);
    }
  };

  const stop = () => {
    try {
      manuallyStoppedRef.current = true;
      recognitionRef.current && recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
    setInterimText("");
  };

  return { isSupported, isListening, interimText, permissionError, start, stop };
}
