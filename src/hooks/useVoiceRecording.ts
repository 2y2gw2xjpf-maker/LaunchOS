/**
 * LaunchOS Voice Recording Hook
 * Nimmt Audio auf und transkribiert es mit Whisper
 */

import { useState, useRef, useCallback } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
}

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  recordingDuration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceRecording | null>;
  transcribe: (audioBlob: Blob) => Promise<string>;
  clearError: () => void;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Startet die Audioaufnahme
   */
  const startRecording = useCallback(async () => {
    setError(null);

    try {
      // Mikrofonzugriff anfordern
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // MediaRecorder erstellen
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      // Daten sammeln
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Aufnahme starten
      mediaRecorder.start(100); // Alle 100ms Daten sammeln
      setIsRecording(true);
      setRecordingDuration(0);

      // Duration Timer starten
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);

    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message.includes('NotAllowed')
          ? 'Mikrofonzugriff wurde verweigert. Bitte erlaube den Zugriff in deinen Browsereinstellungen.'
          : err.message.includes('NotFound')
            ? 'Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.'
            : `Mikrofonfehler: ${err.message}`
        : 'Fehler beim Starten der Aufnahme';

      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, []);

  /**
   * Stoppt die Aufnahme und gibt das Recording zurück
   */
  const stopRecording = useCallback(async (): Promise<VoiceRecording | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      // Duration Timer stoppen
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;

        // Stream-Tracks stoppen
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        resolve({ blob, url, duration });
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  /**
   * Transkribiert eine Audioaufnahme mit Whisper
   */
  const transcribe = useCallback(async (audioBlob: Blob): Promise<string> => {
    if (!isSupabaseConfigured()) {
      setError('Supabase ist nicht konfiguriert. Transkription nicht verfügbar.');
      return '';
    }

    setIsTranscribing(true);
    setError(null);

    try {
      // Blob zu Base64 konvertieren
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Fehler beim Konvertieren der Audio-Datei'));
        reader.readAsDataURL(audioBlob);
      });

      // Transkriptions-Endpoint aufrufen
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/transcribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            audio: base64,
            language: 'de',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Transkription fehlgeschlagen: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Transkription fehlgeschlagen');
      }

      return data.text || '';

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transkription fehlgeschlagen';
      setError(errorMessage);
      console.error('Transcription error:', err);
      return '';
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return {
    isRecording,
    isTranscribing,
    recordingDuration,
    error,
    startRecording,
    stopRecording,
    transcribe,
    clearError,
  };
}

export default useVoiceRecording;
