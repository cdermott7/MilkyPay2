import { useState, useEffect, useCallback, useRef } from 'react';

// Types
type SpeechStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface UseSpeechOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  autoStart?: boolean;
}

/**
 * A hook that provides speech recognition and speech synthesis functionality
 */
export const useSpeech = (options: UseSpeechOptions = {}) => {
  // Default options
  const {
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    autoStart = false,
  } = options;
  
  // States
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // References
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && 
        !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    try {
      // Initialize speech recognition
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.lang = lang;
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      
      // Set up event handlers
      if (recognitionRef.current) {
        const recognition = recognitionRef.current;
        
        recognition.onstart = () => {
          console.log("Speech recognition started");
          setStatus('listening');
          setError(null);
        };
        
        recognition.onend = () => {
          console.log("Speech recognition ended");
          if (status !== 'processing' && !isPaused) {
            setStatus('idle');
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setStatus('error');
          setError(event.error);
        };
        
        recognition.onresult = (event: any) => {
          console.log("Got speech result", event);
          let final = '';
          let interim = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          
          if (final) {
            setTranscript(prev => prev + final);
          }
          setInterimTranscript(interim);
        };
      }
      
      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
      
      setIsSupported(true);
      
      // Auto-start if enabled
      if (autoStart) {
        startListening();
      }
    } catch (err) {
      console.error("Error initializing speech recognition:", err);
      setIsSupported(false);
      setError('Failed to initialize speech recognition');
    }
    
    // Cleanup
    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        if (synthRef.current && synthRef.current.speaking) {
          synthRef.current.cancel();
        }
      } catch (err) {
        console.error("Error cleaning up speech resources:", err);
      }
    };
  }, []);
  
  // Set up speech recognition event handlers
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    const recognition = recognitionRef.current;
    
    recognition.onstart = () => {
      setStatus('listening');
      setError(null);
    };
    
    recognition.onend = () => {
      if (status !== 'processing' && !isPaused) {
        setStatus('idle');
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setStatus('error');
      setError(event.error);
    };
    
    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      setTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };
  }, [status, isPaused]);
  
  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      // Try to initialize it now
      try {
        // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        // Configure recognition
        recognitionRef.current.lang = lang;
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = interimResults;
        
        // Set up event handlers
        recognitionRef.current.onresult = (event: any) => {
          console.log("Got speech result", event);
          let final = '';
          let interim = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          
          if (final) {
            setTranscript(prev => prev + final);
          }
          setInterimTranscript(interim);
        };
        
        recognitionRef.current.onstart = () => {
          console.log("Speech recognition started");
          setStatus('listening');
          setError(null);
        };
        
        recognitionRef.current.onend = () => {
          console.log("Speech recognition ended");
          if (status !== 'processing' && !isPaused) {
            setStatus('idle');
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setStatus('error');
          setError(event.error);
        };
      } catch (initErr) {
        console.error('Failed to initialize speech recognition:', initErr);
        setError('Speech recognition could not be initialized');
        setStatus('error');
        return;
      }
    }
    
    try {
      // Reset transcript before starting
      setTranscript('');
      setInterimTranscript('');
      
      // For browsers that require explicit permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            console.log('Microphone permission granted, starting speech recognition');
            // Start recognition after permission
            recognitionRef.current?.start();
            setStatus('listening');
            setIsPaused(false);
          })
          .catch(err => {
            console.error('Microphone permission denied:', err);
            setError('Microphone access denied. Please allow microphone access and try again.');
            setStatus('error');
          });
      } else {
        // For browsers where permission might be pre-granted
        console.log('Starting speech recognition directly');
        recognitionRef.current.start();
        setStatus('listening');
        setIsPaused(false);
      }
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      // Handle the case where recognition is already started
      if (err instanceof Error && err.message.includes('already started')) {
        // Stop and restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
            setStatus('listening');
            setIsPaused(false);
          }, 100);
        } catch (stopErr) {
          console.error('Error stopping/restarting recognition:', stopErr);
        }
      } else {
        // Other errors
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to start speech recognition');
        }
        setStatus('error');
      }
    }
  }, [lang, continuous, interimResults, status, isPaused]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      setStatus('idle'); // Make sure we show idle state
      return;
    }
    
    try {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
      setStatus('idle');
      setIsPaused(true);
      
      // Let's also log the final transcript before stopping
      console.log('Final transcript on stop:', transcript);
    } catch (err) {
      console.error('Failed to stop speech recognition:', err);
      setStatus('idle'); // Force status to idle even if there was an error
    }
  }, [transcript]);
  
  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);
  
  // Speak text using speech synthesis
  const speak = useCallback((text: string, rate: number = 1, pitch: number = 1) => {
    // Basic validation
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speak function');
      return;
    }
    
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
      setError('Speech synthesis not supported');
      return;
    }
    
    // Ensure we have the synthesis reference
    if (!synthRef.current) {
      synthRef.current = window.speechSynthesis;
    }
    
    try {
      console.log('Speaking text:', text);
      
      // Stop any ongoing speech
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      
      // Create and configure the utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Set up event handlers
      utterance.onstart = () => {
        console.log('Speech started');
        setStatus('speaking');
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setStatus('idle');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setStatus('error');
        setError(`Speech synthesis error: ${event.error}`);
      };
      
      // Speak the text
      synthRef.current.speak(utterance);
    } catch (err) {
      console.error('Error in speech synthesis:', err);
      setStatus('error');
      setError('Failed to synthesize speech');
    }
  }, [lang]);
  
  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setStatus('idle');
    }
  }, []);
  
  // Check if speech recognition is active
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  
  return {
    // State
    transcript,
    interimTranscript,
    status,
    error,
    isSupported,
    isListening,
    isSpeaking,
    
    // Methods
    startListening,
    stopListening,
    resetTranscript,
    speak,
    stopSpeaking,
  };
};

export default useSpeech;