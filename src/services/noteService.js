// Ensure this is in your noteservice.js file
export const sendTranscriptToBackend = async (transcript) => {
    try {
        const response = await fetch('http://localhost:3001/generateNotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript }),
        });
        const data = await response.json();
        return data.notes;
    } catch (error) {
        console.error('Error sending transcript to backend:', error);
        return null;
    }
};


