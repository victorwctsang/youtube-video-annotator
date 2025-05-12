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

## Running

Because browsers have security restrictions for local files (`file://`), this application needs to be served by a web server. Python provides a simple built-in server for this purpose.

1.  **Navigate to the project directory:**
    Open your terminal or command prompt and `cd` into the `youtube_annotator` directory where `index.html` is located.

2.  **Start the local server:**
    *   If you have Python 3:
        ```bash
        python -m http.server
        ```
    *   If you have Python 2:
        ```bash
        python -m SimpleHTTPServer
        ```
    *   *Note:* You can specify a port (e.g., `python -m http.server 8000`). If you don't specify one, it usually defaults to port 8000.

3.  **Open the application in your browser:**
    Go to `http://localhost:8000` (or the port number you specified/was shown in the terminal).

## How to Use

1.  **Enter URL:** Paste a YouTube video URL into the input field and click "Load Video".
2.  **Add Annotations:** Click the "Add Row" button to create a new annotation entry.
3.  **Select Row:** Click anywhere on a row in the table to select it as the "active" row.
4.  **Set Timestamps:**
    *   Manually type the start/end time (MM:SS).
    *   Or, play the video to the desired point, select the row, and click "Set Start" or "Set End". The duration/end time will update automatically.
5.  **Add Description:** Enter a description for the annotation.
6.  **Export:** Click "Export to CSV" to download your annotations.
7.  **Delete:** Click the "Delete" button on any row to remove it.

## Next Steps

* Host this app on a webserver and make it publicly available.
* Enhanced player interaction (e.g. jump to clips, highlight clips in the player)
* Implement keyboard shortcuts.
* Add a connector to google sheets so annotations can be shared directly.