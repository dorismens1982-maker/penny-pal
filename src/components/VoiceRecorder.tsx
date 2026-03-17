import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
    onResult: (result: {
        amount: number;
        type: 'income' | 'expense';
        category: string;
        note: string;
        date: string;
    }) => void;
}

export const VoiceRecorder = ({ onResult }: VoiceRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number | null>(null);
    const { toast } = useToast();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const duration = recordingStartTimeRef.current 
                    ? (Date.now() - recordingStartTimeRef.current) / 1000 
                    : 0;

                if (duration < 0.5) {
                    toast({
                        variant: 'destructive',
                        title: 'Recording too short',
                        description: 'Please hold the button for a bit longer while speaking.',
                    });
                    setIsProcessing(false);
                } else if (audioChunksRef.current.length === 0) {
                     toast({
                        variant: 'destructive',
                        title: 'No audio captured',
                        description: 'Please try again and make sure you are speaking clearly.',
                    });
                    setIsProcessing(false);
                } else {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    await processAudio(audioBlob);
                }
                
                stream.getTracks().forEach(track => track.stop());
                recordingStartTimeRef.current = null;
            };

            mediaRecorder.start();
            recordingStartTimeRef.current = Date.now();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast({
                variant: 'destructive',
                title: 'Microphone Error',
                description: 'Could not access your microphone. Please check permissions.',
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');

            const { data, error } = await supabase.functions.invoke('process-voice-transaction', {
                body: formData,
            });

            if (error) throw error;

            if (data) {
                onResult(data);
                toast({
                    title: 'Voice processed!',
                    description: 'Transaction details have been filled automatically.',
                });
            }
        } catch (error: any) {
            console.error('Error processing voice:', error);
            
            let errorMessage = 'Could not understand the audio. Please try again.';
            
            // supabase-js v2 FunctionsHttpError: context is the Response object
            if (error.context instanceof Response) {
                try {
                    const details = await error.context.json();
                    console.log('Detailed error from server:', details);
                    errorMessage = `${details.error || error.message} (Step: ${details.step || 'unknown'})`;
                } catch (parseError) {
                    console.error('Failed to parse error JSON:', parseError);
                    errorMessage = error.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                variant: 'destructive',
                title: 'AI Processing Failed',
                description: errorMessage,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20 animate-in fade-in zoom-in duration-300">
            <div className="text-sm font-medium text-muted-foreground">
                {isRecording ? "Listening... Speak now 🎙️" : isProcessing ? "AI is thinking... 🧠" : "Try saying: 'I spent 50 cedis on fuel'"}
            </div>
            
            <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 ${isRecording ? 'animate-pulse scale-110' : 'hover:scale-105'}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : isRecording ? (
                    <MicOff className="h-8 w-8" />
                ) : (
                    <Mic className="h-8 w-8 text-primary" />
                )}
            </Button>
            
            {isRecording && (
                <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            )}
        </div>
    );
};
