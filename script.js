// Global variables
var player;
var videoId;
var isPlayerReady = false;

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
}

// Called when the player's state changes
function onPlayerStateChange(event) {
    // Optional: Handle player state changes if needed
}

// Called when the player encounters an error
function onPlayerError(event) {
    isPlayerReady = false;
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Load video from URL
function loadVideo() {
    if (!isPlayerReady) {
        if (player && typeof player.loadVideoById === 'function') {
            // Continue even if not ready but player exists
        } else {
            alert('Player is not ready yet. Please wait a moment and try again.');
            return;
        }
    }

    const urlInput = document.getElementById('youtubeUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }

    videoId = extractVideoId(url);
    if (!videoId) {
        alert('Invalid YouTube URL');
        return;
    }

    try {
        player.loadVideoById(videoId);
    } catch (error) {
        alert('Error loading video. Please try again.');
    }
}

// Add new row to the annotation table
function addNewRow() {
    const tbody = document.getElementById('annotationTableBody');
    const row = document.createElement('tr');
    // Add click listener to set this row as active
    row.onclick = function() { setActiveRow(this); };
    
    row.innerHTML = `
        <td><input type="text" class="start-time" placeholder="MM:SS" onchange="updateEndTime(this)"></td>
        <td><input type="text" class="end-time" placeholder="MM:SS" onchange="updateDuration(this)"></td>
        <td><input type="text" class="duration" placeholder="MM:SS" readonly></td>
        <td><input type="text" class="description" placeholder="Enter description"></td>
        <td><button class="delete-button" onclick="deleteRow(this)">Delete</button></td>
    `;
    
    tbody.appendChild(row);
    // Automatically set the new row as active
    setActiveRow(row);
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
    // If the deleted row was active, try to set the previous or first row as active
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
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
}

// Convert seconds to timestamp
function secondsToTimestamp(seconds) {
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
    
    if (startTimeInput.value && durationInput.value) {
        const duration = timestampToSeconds(durationInput.value);
        const endTime = startTime + duration;
        endTimeInput.value = secondsToTimestamp(endTime);
    }
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
            endTimeInput.value = '';
            durationInput.value = '';
        }
    }
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
        
        // Escape commas in description
        const escapedDescription = description.replace(/,/g, ';');
        
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