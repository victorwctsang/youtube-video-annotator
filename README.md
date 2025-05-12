# YouTube Video Annotator

A simple web-based UI for annotating YouTube videos, specifically designed for marking highlights or points of interest.

## Features

*   **Load YouTube Videos:** Paste any YouTube video URL to load it into the embedded player.
*   **Annotation Table:** Add timestamped annotations with descriptions.
*   **Timestamp Input:**
    *   Manually enter start and end times in MM:SS format.
    *   Automatically calculate duration based on start/end times.
    *   Automatically calculate end time based on start time/duration.
    *   "Set Start" and "Set End" buttons to capture the current video time for the selected annotation row.
*   **Active Row Selection:** Click on a row in the table to make it the active row for timestamp setting.
*   **CSV Export:** Export all annotations to a CSV file.
*   **Responsive Design:** The interface adapts to different screen sizes.

## How to Use

1.  **Open App**: Go to https://victorwctsang.github.io/youtube-video-annotator/.
2.  **Enter URL:** Paste a YouTube video URL into the input field and click "Load Video".
3.  **Add Annotations:** Click the "Add Row" button to create a new annotation entry.
4.  **Select Row:** Click anywhere on a row in the table to select it as the "active" row.
5.  **Set Timestamps:**
    *   Manually type the start/end time (MM:SS).
    *   Or, play the video to the desired point, select the row, and click "Set Start" or "Set End". The duration/end time will update automatically.
6.  **Add Description:** Enter a description for the annotation.
7.  **Export:** Click "Export to CSV" to download your annotations.
8.  **Delete:** Click the "Delete" button on any row to remove it.

## Next Steps

* Host this app on a webserver and make it publicly available.
* Enhanced player interaction (e.g. jump to clips, highlight clips in the player)
* Implement keyboard shortcuts.
* Add a connector to google sheets so annotations can be shared directly.