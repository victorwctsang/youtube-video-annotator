// Global variables
var player;
var videoId;
var isPlayerReady = false;
let seekToTimeOnLoad = 0;
let initialUrl = localStorage.getItem('lastYouTubeUrl');

// Check for saved timestamp on initial load
if (initialUrl) {
    seekToTimeOnLoad = parseFloat(localStorage.getItem('lastTimestamp')) || 0;
}

// This function is called automatically by YouTube IFrame API
function onYouTubeIframeAPIReady() {
    const origin = window.location.protocol === 'file:' ? '*' : window.location.origin;
    
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '', // Start with no video
        playerVars: {
            'playsinline': 1,
            'enablejsapi': 1,
            'origin': origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

// Called when the player is ready
function onPlayerReady(event) {
    isPlayerReady = true;
    player = event.target;
    // If there was a saved URL, load it now
    if (initialUrl) {
        document.getElementById('youtubeUrl').value = initialUrl;
        loadVideo(initialUrl); // Load video, but don't save URL again yet
    }
}

// Called when the player's state changes
function onPlayerStateChange(event) {
    // Seek to the saved time once the video is ready (playing, paused, or cued)
    if (seekToTimeOnLoad > 0 && 
        (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED)) {
        player.seekTo(seekToTimeOnLoad, true);
        seekToTimeOnLoad = 0; // Reset flag so we don't seek again
    }
}

// Called when the player encounters an error
function onPlayerError(event) {
    isPlayerReady = false;
    localStorage.removeItem('lastTimestamp'); // Clear timestamp if video fails
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Handler for the Load Video button click
function handleLoadVideoClick() {
    const urlInput = document.getElementById('youtubeUrl');
    const url = urlInput.value.trim();
    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }

    // Check if there are existing annotations
    const existingAnnotations = localStorage.getItem('annotations');
    let proceed = true;
    if (existingAnnotations && existingAnnotations !== '[]') {
        proceed = confirm('Loading a new video will clear existing annotations. Proceed?');
    }

    if (proceed) {
        // Clear existing annotations from storage and UI
        localStorage.removeItem('annotations');
        clearAnnotationTableUI();

        // Save the new URL and clear old timestamp
        localStorage.setItem('lastYouTubeUrl', url);
        localStorage.removeItem('lastTimestamp');
        seekToTimeOnLoad = 0; // Reset seek time
        loadVideo(url);
    } else {
        // If user cancelled, revert the input field to the stored URL
        urlInput.value = localStorage.getItem('lastYouTubeUrl') || '';
    }
}

// Helper function to clear the annotation table UI
function clearAnnotationTableUI() {
    const tbody = document.getElementById('annotationTableBody');
    tbody.innerHTML = '';
}

// Load video function (now takes URL as argument)
function loadVideo(url) {
    if (!isPlayerReady) {
        alert('Player is not ready yet. Please wait a moment and try again.');
        return;
        // Note: Removed the fallback check here as onPlayerReady handles initial load
    }

    const currentVideoId = extractVideoId(url);
    if (!currentVideoId) {
        alert('Invalid YouTube URL');
        localStorage.removeItem('lastYouTubeUrl'); // Clear saved URL on error
        localStorage.removeItem('lastTimestamp');
        return;
    }

    videoId = currentVideoId; // Store globally if needed elsewhere

    try {
        player.loadVideoById(videoId);
    } catch (error) {
        alert('Error loading video. Please try again.');
        localStorage.removeItem('lastYouTubeUrl'); // Clear saved URL on error
        localStorage.removeItem('lastTimestamp');
    }
}

// Save the current timestamp to localStorage
function saveCurrentTimestamp() {
    if (player && typeof player.getCurrentTime === 'function' && isPlayerReady) {
        const currentTime = player.getCurrentTime();
        if (currentTime > 0) { // Only save if time is valid
            localStorage.setItem('lastTimestamp', currentTime);
        }
    }
}

// Add event listener to save timestamp before unloading
window.addEventListener('beforeunload', saveCurrentTimestamp);

// ---- LocalStorage for Annotations ----

function saveAnnotationsToLocalStorage() {
    const rows = document.querySelectorAll('#annotationTableBody tr');
    const annotations = [];
    rows.forEach(row => {
        const startTime = row.querySelector('.start-time').value;
        const endTime = row.querySelector('.end-time').value;
        const duration = row.querySelector('.duration').value;
        const description = row.querySelector('.description').value;
        annotations.push({ startTime, endTime, duration, description });
    });
    localStorage.setItem('annotations', JSON.stringify(annotations));
}

function loadAnnotationsFromLocalStorage() {
    const savedAnnotations = localStorage.getItem('annotations');
    if (savedAnnotations) {
        try {
            const annotations = JSON.parse(savedAnnotations);
            const tbody = document.getElementById('annotationTableBody');
            tbody.innerHTML = ''; // Clear any existing rows (should be empty on load)

            annotations.forEach((anno, index) => {
                const row = document.createElement('tr');
                row.onclick = function() { setActiveRow(this); };
                row.innerHTML = `
                    <td><input type="text" class="start-time" placeholder="MM:SS" value="${anno.startTime || ''}" onchange="updateEndTime(this)"></td>
                    <td><input type="text" class="end-time" placeholder="MM:SS" value="${anno.endTime || ''}" onchange="updateDuration(this)"></td>
                    <td><input type="text" class="duration" placeholder="MM:SS" value="${anno.duration || ''}" readonly></td>
                    <td><input type="text" class="description" placeholder="Enter description" value="${anno.description || ''}"></td>
                    <td><button class="delete-button" onclick="deleteRow(this)">Delete</button></td>
                `;
                tbody.appendChild(row);
                // Set the first loaded row as active initially
                if (index === 0) {
                    setActiveRow(row);
                }
            });
        } catch (error) {
            console.error('Error loading annotations from localStorage:', error);
            localStorage.removeItem('annotations'); // Clear corrupted data
        }
    }
}

// ---- Initialization ----

// Load annotations when the DOM is ready
document.addEventListener('DOMContentLoaded', loadAnnotationsFromLocalStorage);

// Add new row to the annotation table
function addNewRow() {
    const tbody = document.getElementById('annotationTableBody');
    const row = document.createElement('tr');
    row.onclick = function() { setActiveRow(this); };
    
    row.innerHTML = `
        <td><input type="text" class="start-time" placeholder="MM:SS" onchange="updateEndTime(this)"></td>
        <td><input type="text" class="end-time" placeholder="MM:SS" onchange="updateDuration(this)"></td>
        <td><input type="text" class="duration" placeholder="MM:SS" readonly></td>
        <td><input type="text" class="description" placeholder="Enter description" oninput="saveAnnotationsToLocalStorage()"></td>
        <td><button class="delete-button" onclick="deleteRow(this)">Delete</button></td>
    `;
    
    tbody.appendChild(row);
    setActiveRow(row);
    saveAnnotationsToLocalStorage(); // Save after adding
}

// Set the clicked row as the active row
function setActiveRow(rowElement) {
    const currentActive = document.querySelector('#annotationTableBody tr.active-row');
    if (currentActive) {
        currentActive.classList.remove('active-row');
    }
    rowElement.classList.add('active-row');
}

// Set start time for the currently active row
function setStartTimeForActiveRow() {
    const activeRow = document.querySelector('#annotationTableBody tr.active-row');
    if (!activeRow) {
        alert('Please select a row first by clicking on it.');
        return;
    }
    if (!player || typeof player.getCurrentTime !== 'function') {
        alert('Player is not ready yet.');
        return;
    }
    const currentTime = Math.floor(player.getCurrentTime());
    const formatted = secondsToTimestamp(currentTime);
    const startTimeInput = activeRow.querySelector('.start-time');
    startTimeInput.value = formatted;
    updateEndTime(startTimeInput);
}

// Set end time for the currently active row
function setEndTimeForActiveRow() {
    const activeRow = document.querySelector('#annotationTableBody tr.active-row');
    if (!activeRow) {
        alert('Please select a row first by clicking on it.');
        return;
    }
    if (!player || typeof player.getCurrentTime !== 'function') {
        alert('Player is not ready yet.');
        return;
    }
    const currentTime = Math.floor(player.getCurrentTime());
    const formatted = secondsToTimestamp(currentTime);
    const endTimeInput = activeRow.querySelector('.end-time');
    endTimeInput.value = formatted;
    updateDuration(endTimeInput);
}

// Delete row from the table
function deleteRow(button) {
    const row = button.closest('tr');
    const wasActive = row.classList.contains('active-row');
    row.remove();
    saveAnnotationsToLocalStorage(); // Save after deleting
    
    if (wasActive) {
        const firstRow = document.querySelector('#annotationTableBody tr');
        if (firstRow) {
            setActiveRow(firstRow);
        }
    }
}

// Convert timestamp to seconds
function timestampToSeconds(timestamp) {
    if (!timestamp) return 0;
    const parts = timestamp.split(':');
    if (parts.length === 2) {
        // Add validation for non-numeric parts
        const mins = parseInt(parts[0]);
        const secs = parseInt(parts[1]);
        if (!isNaN(mins) && !isNaN(secs)) {
            return mins * 60 + secs;
        }
    }
    return 0;
}

// Convert seconds to timestamp
function secondsToTimestamp(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update end time based on start time and duration
function updateEndTime(startTimeInput) {
    const row = startTimeInput.closest('tr');
    const startTime = timestampToSeconds(startTimeInput.value);
    const durationInput = row.querySelector('.duration');
    const endTimeInput = row.querySelector('.end-time');
    const durationStr = durationInput.value;
    
    if (startTimeInput.value && durationStr) {
        const duration = timestampToSeconds(durationStr);
        if (duration > 0) {
            const endTime = startTime + duration;
            endTimeInput.value = secondsToTimestamp(endTime);
        }
    } // Removed else block to avoid clearing unnecessarily
    saveAnnotationsToLocalStorage(); // Save after updating
}

// Update duration based on start and end time
function updateDuration(endTimeInput) {
    const row = endTimeInput.closest('tr');
    const startTimeInput = row.querySelector('.start-time');
    const durationInput = row.querySelector('.duration');
    
    if (startTimeInput.value && endTimeInput.value) {
        const startTime = timestampToSeconds(startTimeInput.value);
        const endTime = timestampToSeconds(endTimeInput.value);
        const duration = endTime - startTime;
        
        if (duration >= 0) {
            durationInput.value = secondsToTimestamp(duration);
        } else {
            alert('End time must be after start time');
            durationInput.value = '';
        }
    } // Removed else block to avoid clearing unnecessarily
    saveAnnotationsToLocalStorage(); // Save after updating
}

// Export table data to CSV
function exportToCSV() {
    const rows = document.querySelectorAll('#annotationTableBody tr');
    if (rows.length === 0) {
        alert('No data to export');
        return;
    }

    let csvContent = 'Start Time,End Time,Duration,Description\n';
    
    rows.forEach(row => {
        const startTime = row.querySelector('.start-time').value;
        const endTime = row.querySelector('.end-time').value;
        const duration = row.querySelector('.duration').value;
        const description = row.querySelector('.description').value;
        
        // Escape commas and quotes in description
        const escapedDescription = '"' + description.replace(/"/g, '""') + '"';
        
        csvContent += `${startTime},${endTime},${duration},${escapedDescription}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'volleyball_annotations.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 