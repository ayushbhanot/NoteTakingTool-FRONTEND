import React, { useState, useEffect } from 'react';
import './NotesUI.css';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

const NotesUI = ({ notes = {} }) => {
    const [editableNotes, setEditableNotes] = useState({});
    let debounceTimer; // Define debounceTimer in the component scope

    // Update editableNotes when notes prop changes
    useEffect(() => {
        setEditableNotes(notes);
    }, [notes]);

    // Handle content changes on note edit
    const handleContentChange = (topic, index, event) => {
        const updatedNotes = { ...editableNotes };
        updatedNotes[topic][index] = event.target.innerText;

        // Debounce state update
        clearTimeout(debounceTimer); // Clear any existing timers before setting a new one
        debounceTimer = setTimeout(() => {
            setEditableNotes(updatedNotes);
            console.log("Notes updated:", updatedNotes);
        }, 300);  // 300ms debounce time
    };

    // Render the notes
    const renderNotes = () => {
        if (Object.keys(editableNotes).length === 0) {
            return <div>No notes available</div>;
        }

        return Object.entries(editableNotes).map(([topic, notesList]) => (
            <div key={topic}>
                <div className="topic">{topic}</div>
                {Array.isArray(notesList) ? (
                    notesList.map((note, index) => (
                        <div
                            key={index}
                            className="note"
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onInput={(event) => handleContentChange(topic, index, event)}
                        >
                            {note}
                        </div>
                    ))
                ) : (
                    <div
                        className="note"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onInput={(event) => handleContentChange(topic, 0, event)}
                    >
                        {notesList}
                    </div>
                )}
            </div>
        ));
    };

    // Download notes as a PDF
    const downloadNotes = () => {
        const doc = new jsPDF();
        const title = prompt("Enter a title for your notes:", "Meeting Notes");
        if (!title) return;

        const notesContainer = document.getElementById('notes-container');

        html2canvas(notesContainer, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${title}.pdf`);
        });
    };

    return (
        <div>
            <div id="notes-container">
                {renderNotes()}
            </div>
            <div id="bottom-right-container">
                <button className="download-btn" onClick={downloadNotes}>Download Notes as PDF</button>
                <span className="instruction-text">Click any note to edit</span>
            </div>
        </div>
    );
};

export default NotesUI;
