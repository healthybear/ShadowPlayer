## ADDED Requirements

### Requirement: System displays video in HTML5 video player
The system SHALL render video content using an HTML5 video element with standard playback controls.

#### Scenario: Video loads and displays
- **WHEN** user opens a video from the library
- **THEN** system loads the video into the player and displays the first frame

#### Scenario: Video fails to load
- **WHEN** video file cannot be loaded (file moved, corrupted, or unsupported codec)
- **THEN** system displays an error message "Unable to load video. The file may be missing or corrupted."

### Requirement: User can play and pause video
The system SHALL provide play and pause controls for video playback.

#### Scenario: User plays video
- **WHEN** user clicks the play button while video is paused
- **THEN** system starts video playback and changes button to pause icon

#### Scenario: User pauses video
- **WHEN** user clicks the pause button while video is playing
- **THEN** system pauses video playback and changes button to play icon

#### Scenario: User toggles play/pause with spacebar
- **WHEN** user presses the spacebar key
- **THEN** system toggles between play and pause states

### Requirement: User can seek to specific time positions
The system SHALL allow users to navigate to any position in the video using a progress bar.

#### Scenario: User drags progress bar
- **WHEN** user drags the progress bar handle to a new position
- **THEN** system seeks to the corresponding time position and updates the video frame

#### Scenario: User clicks on progress bar
- **WHEN** user clicks anywhere on the progress bar
- **THEN** system seeks to the time position corresponding to the click location

#### Scenario: User seeks with arrow keys
- **WHEN** user presses the left arrow key
- **THEN** system seeks backward 5 seconds

#### Scenario: User seeks forward with arrow keys
- **WHEN** user presses the right arrow key
- **THEN** system seeks forward 5 seconds

### Requirement: User can control playback volume
The system SHALL provide volume controls allowing users to adjust audio level from 0% to 100%.

#### Scenario: User adjusts volume with slider
- **WHEN** user drags the volume slider
- **THEN** system adjusts audio volume to the selected level (0-100%)

#### Scenario: User increases volume with keyboard
- **WHEN** user presses the up arrow key
- **THEN** system increases volume by 10% (capped at 100%)

#### Scenario: User decreases volume with keyboard
- **WHEN** user presses the down arrow key
- **THEN** system decreases volume by 10% (minimum 0%)

#### Scenario: User toggles mute
- **WHEN** user presses the M key or clicks the mute button
- **THEN** system toggles between muted and unmuted states, preserving the previous volume level

### Requirement: User can adjust playback speed
The system SHALL allow users to change video playback speed with preset options: 0.5x, 0.75x, 1x, 1.25x, 1.5x, and 2x.

#### Scenario: User selects playback speed
- **WHEN** user selects a speed option from the speed menu
- **THEN** system changes playback rate to the selected speed and displays the current speed (e.g., "1.5x")

#### Scenario: User increases speed with keyboard
- **WHEN** user presses the > key
- **THEN** system increases playback speed by one step (e.g., 1x → 1.25x), capped at 2x

#### Scenario: User decreases speed with keyboard
- **WHEN** user presses the < key
- **THEN** system decreases playback speed by one step (e.g., 1x → 0.75x), minimum 0.5x

### Requirement: User can toggle fullscreen mode
The system SHALL allow users to enter and exit fullscreen mode for the video player.

#### Scenario: User enters fullscreen
- **WHEN** user clicks the fullscreen button or presses the F key
- **THEN** system expands the video player to fill the entire screen

#### Scenario: User exits fullscreen
- **WHEN** user clicks the exit fullscreen button, presses F key, or presses Escape key while in fullscreen
- **THEN** system returns the video player to normal size

#### Scenario: Fullscreen not supported
- **WHEN** browser does not support fullscreen API
- **THEN** system hides the fullscreen button

### Requirement: System displays current time and duration
The system SHALL display the current playback time and total video duration in MM:SS or HH:MM:SS format.

#### Scenario: Time display updates during playback
- **WHEN** video is playing
- **THEN** system updates the current time display in real-time (e.g., "01:23 / 05:45")

#### Scenario: Duration is displayed on load
- **WHEN** video metadata is loaded
- **THEN** system displays the total duration in the time display

### Requirement: System responds to keyboard shortcuts
The system SHALL provide keyboard shortcuts for common playback controls.

#### Scenario: Spacebar toggles play/pause
- **WHEN** user presses spacebar
- **THEN** system toggles between play and pause

#### Scenario: Arrow keys control seeking and volume
- **WHEN** user presses left/right arrow keys
- **THEN** system seeks backward/forward by 5 seconds
- **WHEN** user presses up/down arrow keys
- **THEN** system increases/decreases volume by 10%

#### Scenario: Letter keys trigger actions
- **WHEN** user presses F key
- **THEN** system toggles fullscreen mode
- **WHEN** user presses M key
- **THEN** system toggles mute
- **WHEN** user presses C key
- **THEN** system toggles subtitle visibility

#### Scenario: Keyboard shortcuts are disabled in input fields
- **WHEN** user is typing in a text input field
- **THEN** system does not trigger keyboard shortcuts

### Requirement: System preloads video metadata efficiently
The system SHALL load video metadata without downloading the entire video file to optimize initial load time.

#### Scenario: Metadata preload for blob storage
- **WHEN** video is stored as a Blob in IndexedDB
- **THEN** system uses preload="metadata" attribute to load only metadata initially

#### Scenario: Metadata preload for file handle storage
- **WHEN** video is stored using File System Access API
- **THEN** system retrieves the file handle and loads metadata before full video data
