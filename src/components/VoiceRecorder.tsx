import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Star, Zap } from 'lucide-react';
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
    const [credits, setCredits] = useState<number | 'unlimited'>(5);
    const [isPremium, setIsPremium] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number | null>(null);
    const { toast } = useToast();

    // Fetch account status on mount
    React.useEffect(() => {
        const fetchStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('voice_credits, is_premium, last_voice_usage_reset, feedback_reward_claimed_at')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                const data = profile as any;
                let currentCredits = data.voice_credits ?? 0;
                const lastReset = data.last_voice_usage_reset ? new Date(data.last_voice_usage_reset) : new Date(0);
                const lastClaimed = data.feedback_reward_claimed_at ? new Date(data.feedback_reward_claimed_at) : null;
                const now = new Date();

                // Lazy Monthly Reset
                if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
                    currentCredits = 5;
                    await supabase.from('profiles').update({ 
                        voice_credits: currentCredits,
                        last_voice_usage_reset: now.toISOString()
                    } as any).eq('user_id', user.id);
                }

                setIsPremium(data.is_premium);
                setCredits(data.is_premium ? 'unlimited' : currentCredits);
                
                // Track if reward was claimed THIS month
                const claimedThisMonth = lastClaimed && 
                    lastClaimed.getMonth() === now.getMonth() && 
                    lastClaimed.getFullYear() === now.getFullYear();
                setRewardClaimed(!!claimedThisMonth);
            }
        };
        fetchStatus();
    }, []);

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
                if (data.remaining_credits !== undefined) {
                    setCredits(data.remaining_credits);
                }
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

    const submitFeedback = async () => {
        if (!feedback.trim()) return;
        setIsSubmittingFeedback(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            // 1. Save feedback
            const { error: fError } = await supabase
                .from('voice_feedback')
                .insert({ user_id: user.id, message: feedback });
            if (fError) throw fError;

            // 2. Grant reward (+5 credits)
            const newCredits = (typeof credits === 'number' ? credits : 0) + 5;
            const { error: pError } = await supabase
                .from('profiles')
                .update({ 
                    voice_credits: newCredits,
                    feedback_reward_claimed_at: new Date().toISOString()
                } as any)
                .eq('user_id', user.id);
            if (pError) throw pError;

            setCredits(newCredits);
            setRewardClaimed(true);
            setShowFeedback(false);
            setFeedback('');
            toast({
                title: 'Credits Unlocked! 💎',
                description: 'We added +5 Voice Stars as a thank you for your feedback.',
            });
        } catch (error: any) {
            console.error('Error submitting feedback:', error);
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: 'Could not submit feedback. Please try again.',
            });
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl border-2 border-dashed border-primary/20 animate-in fade-in zoom-in duration-500 shadow-inner w-full overflow-hidden">
            {!showFeedback ? (
                <>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="text-sm font-semibold text-foreground">
                            {isRecording ? "Listening... Speak now 🎙️" : isProcessing ? "AI is thinking... 🧠" : "Just talk. I'll handle the rest. 🎤"}
                        </div>
                        {!isRecording && !isProcessing && (
                            <div className="text-xs text-muted-foreground italic">
                                Try: "I spent 50 cedis on fuel"
                            </div>
                        )}
                    </div>
                    
                    <div className="relative">
                        <Button
                            type="button"
                            variant={isRecording ? "destructive" : "outline"}
                            size="lg"
                            className={`h-20 w-20 rounded-full shadow-xl transition-all duration-500 ${isRecording ? 'animate-pulse scale-110 ring-4 ring-destructive/20' : 'hover:scale-105 border-primary/20 bg-background/50'}`}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isProcessing || (credits === 0 && !isPremium)}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            ) : isRecording ? (
                                <MicOff className="h-10 w-10" />
                            ) : (
                                <Mic className={`h-10 w-10 ${credits === 0 && !isPremium ? 'text-muted-foreground' : 'text-primary'}`} />
                            )}
                        </Button>
                        
                        {isRecording && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
                                <span className="h-2 w-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2 mt-2 w-full">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-background/50 rounded-full border border-primary/10 shadow-sm">
                            <Star className={`h-4 w-4 ${credits === 0 && !isPremium ? 'text-muted-foreground' : 'text-yellow-500 fill-yellow-500'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {isPremium ? "Unlimited Mode" : `${credits} Voice Credits Left`}
                            </span>
                        </div>

                        {(credits === 0 && !isPremium) && (
                            <div className="flex flex-col items-center gap-3 mt-1 px-4 text-center">
                                {!rewardClaimed ? (
                                    <>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            You've used all 5 free credits! Give us feedback to unlock 5 more.
                                        </p>
                                        <Button 
                                            variant="default" 
                                            size="sm" 
                                            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg animate-bounce"
                                            onClick={() => setShowFeedback(true)}
                                        >
                                            <Zap className="h-4 w-4 mr-2 fill-white" />
                                            Unlock +5 Stars
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                            Monthly Limit Reached
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Your 5 free credits will renew next month.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="w-full space-y-4 py-2 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                             <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                             Unlock 5 More Voice Stars
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            What's one thing we can do better with Voice AI?
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                         <textarea
                            className="w-full min-h-[80px] p-3 rounded-xl border border-muted-foreground/20 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Type your suggestion here... (Required)"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={isSubmittingFeedback}
                         />
                         
                         <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex-1 rounded-xl"
                                onClick={() => setShowFeedback(false)}
                                disabled={isSubmittingFeedback}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="flex-[2] bg-primary rounded-xl font-bold shadow-md hover:shadow-lg"
                                onClick={submitFeedback}
                                disabled={isSubmittingFeedback || !feedback.trim()}
                            >
                                {isSubmittingFeedback ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Zap className="h-4 w-4 mr-2 fill-white" />
                                )}
                                Submit & Unlock
                            </Button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};
