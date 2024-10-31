let recognition;
export let finalTranscript = ''; // This will hold the full transcript
let interimTranscript = ''; // This will hold the interim transcript during a session
let isRecognitionRunning = false;
let shouldRestart = true;  // New flag to control whether to restart
let inactivityTimeout; // For tracking inactivity timeout
const INACTIVITY_THRESHOLD = 30000; // 30 seconds of inactivity before restarting
const RESTART_DELAY = 550;  // 2-second delay before restarting
const CHARACTER_THRESHOLD = 300; // Threshold for interim transcript size

export function initializeRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        alert('Browser does not support SpeechRecognition API.');
        console.log('SpeechRecognition API not supported');
        return;
    }

    recognition = new window.SpeechRecognition();
    recognition.continuous = true;  // Keep recognition continuous
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        clearTimeout(inactivityTimeout);  // Clear any existing inactivity timeout
        let interim = '';
    
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
    
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';  // Append final transcript
                interimTranscript = '';  // Clear interim transcript
                console.log('Final Transcript (updated):', finalTranscript);
            } else {
                interim = transcript;  // Store interim results without appending multiple times
            }
        }
    
        interimTranscript = interim;
        console.log('Interim Transcript (updated):', interimTranscript);
    };
    
    
    recognition.onspeechend = () => {
        console.log('Speech ended. Waiting to see if the user continues...');
        inactivityTimeout = setTimeout(() => {
            if (isRecognitionRunning && shouldRestart) {
                console.log('No further speech detected. Restarting recognition...');
                restartRecognition();
            }
        }, 5000);  // 5 seconds of inactivity before restarting
    };
    
    
    recognition.onerror = (event) => {
        console.log('Recognition error:', event.error);
    
        if (event.error === 'no-speech') {
            console.log('No speech detected.');
        } else if (event.error === 'aborted') {
            console.log('Recognition aborted unexpectedly. Restarting...');
            restartRecognition();  // Restart automatically on aborted
        } else {
            console.log('Other error:', event.error);
            restartRecognition();
        }
    };
    
    
    
    recognition.onend = () => {
        console.log('Recognition ended.');
        if (interimTranscript.trim() !== '') {
            finalTranscript += interimTranscript.trim() + ' ';
            interimTranscript = '';
            console.log('Appended final Interim Transcript:', finalTranscript);
        }
    
        if (isRecognitionRunning && shouldRestart) {
            console.log('Recognition stopped unexpectedly. Restarting...');
            restartRecognition();
        } else {
            console.log('No restart needed.');
        }
    };
    
    

    console.log('Speech recognition initialized.');
}


// Start Speech Recognition
export function startRecognition() {
    if (!isRecognitionRunning) {
        console.log('Starting recognition...');
        try {
            recognition.start();
            isRecognitionRunning = true;
        } catch (error) {
            console.log('Recognition start failed:', error);
            // Retry after a short delay if start fails
            setTimeout(startRecognition, 1000);
        }
    } else {
        console.log('Recognition already running.');
    }
}

export async function startSpeechRecognition() {
    const permissionGranted = await requestMicPermission();
    if (!permissionGranted) return;

    if (!recognition) {
        initializeRecognition();
    }
    startRecognition();
}


// Stop Speech Recognition
export function stopRecognition() {
    if (isRecognitionRunning) {
        console.log('Stopping recognition...');

        // Append any remaining interim transcript to the final transcript
        if (interimTranscript.trim() !== '') {
            finalTranscript += interimTranscript.trim() + ' ';
            interimTranscript = '';  // Clear interim transcript
            console.log('Appended final Interim Transcript:', finalTranscript);
        }

        shouldRestart = false;  // Prevent unwanted restarts
        recognition.stop();
        clearTimeout(inactivityTimeout);
        isRecognitionRunning = false;
    }
}


let cooldownActive = false;  // New flag to prevent immediate restarts

function restartRecognition() {
    if (!shouldRestart || cooldownActive) return;  // Prevent restarts if manually stopped or cooldown active
    
    cooldownActive = true;  // Activate cooldown
    console.log('Stopping recognition before restarting...');
    recognition.stop();
    isRecognitionRunning = false;

    setTimeout(() => {
        console.log('Restarting recognition...');
        startRecognition();
        cooldownActive = false;  // Release cooldown after restart
    }, 500);  // 500ms restart delay
}



export function resetTranscript() {
    finalTranscript = '';  // Reset the final transcript manually when called
    console.log('Transcript has been reset.');
}


// Request microphone permission
export async function requestMicPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone permission granted');
        return true;
    } catch (error) {
        alert('Microphone access is required.');
        console.log('Microphone permission denied');
        return false;
    }
}

// Export the final transcript for use elsewhere
export const getFinalTranscript = () => finalTranscript;
