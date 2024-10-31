const { exec } = require('child_process');
const { generateNotes } = require('../src/services/openAIService'); 
const { transcribeAudio } = require('../src/services/transcriptionService');
const { organizeNotesByTopic } = require('../src/services/noteOrganizer'); 
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Function to convert the audio file to mono
async function convertToMono(inputFilePath) {
    const outputFilePath = inputFilePath.replace('.wav', '_mono.wav');
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .audioChannels(1)  // Set audio to mono
            .output(outputFilePath)
            .on('end', function() {
                console.log('Audio file converted to mono');
                resolve(outputFilePath);
            })
            .on('error', function(err) {
                console.error('Error converting audio to mono:', err);
                reject(err);
            })
            .run();
    });
}

// Function to split the audio file into chunks
async function splitAudioFile(inputFilePath, chunkDuration) {
    const outputDir = path.join(__dirname, '../audio_chunks');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .output(`${outputDir}/chunk%03d.wav`)
            .outputOptions([`-f segment`, `-segment_time ${chunkDuration}`, `-c copy`])
            .on('end', function () {
                console.log('Audio file split into chunks');
                resolve(fs.readdirSync(outputDir).map(file => path.join(outputDir, file)));
            })
            .on('error', function (err) {
                console.error('Error splitting audio file:', err);
                reject(err);
            })
            .run();
    });
}

// Function to process the audio chunks
async function processAudioChunks(audioChunkPaths) {
    let combinedTranscript = '';

    for (const chunkPath of audioChunkPaths) {
        try {
            const transcript = await transcribeAudio(chunkPath);
            console.log('Transcript for chunk:', transcript);

            combinedTranscript += transcript + '\n'; // Combine the transcript of each chunk into one single transcript

        } catch (error) {
            console.error('Error processing audio chunk:', error);
        }
    }

    try {
        const notes = await generateNotes(combinedTranscript);
        console.log('Generated Notes:', notes);
        // Generate notes from the combined transcript

        const organizedNotes = organizeNotesByTopic(notes);
        console.log('Organized Notes:', organizedNotes);
        // Organize the notes by topic
        return organizedNotes; // Return the final organized notes

    } catch (error) {
        console.error('Error generating or organizing notes:', error);
        return {}; // Return an empty object if there was an error
    }
}

// Main function to run the test
async function runTest(audioFilePath) {
    try {
        const monoFilePath = await convertToMono(audioFilePath);  // Convert to mono
        const chunkDuration = 30; // Set chunk duration
        const audioChunkPaths = await splitAudioFile(monoFilePath, chunkDuration);
        const allNotes = await processAudioChunks(audioChunkPaths);

        const outputPath = path.join(__dirname, '../public/notes.json');
        fs.writeFileSync(outputPath, JSON.stringify(allNotes, null, 2));
        console.log('All notes saved to:', outputPath);

    } catch (error) {
        console.error('Error processing audio file:', error);
    }
}

// Start the React app
const startReactApp = () => {
    const reactAppPath = path.join(__dirname, '..'); 
    exec('npm start', { cwd: reactAppPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting React app: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`React app stderr: ${stderr}`);
            return;
        }
        console.log(`React app output: ${stdout}`);
    });
};

// Run the test and then start the React app
const audioFilePath = '/Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/TestAudios/GoalsToSelf.wav';
runTest(audioFilePath);
startReactApp();

/*
Test Terminal Command: node /Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/aitranscriptionapp/public/testAudioNotes.js

**TEST AUDIO FILES**

Spiderman Intro (0:10):
/Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/TestAudios/TestAudio.wav

Speaking Skills (10:00):
/Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/TestAudios/SpeakingSkills.wav

Goals to Self (3:45):
/Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/TestAudios/GoalsToSelf.wav

How to Achieve Most Ambitious Goals (18:00):
/Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/TestAudios/AmbitiousGoals.wav

Bio 25 Mins Crammed (25:40):
/Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/TestAudios/Bio25minCram.wav
*/
