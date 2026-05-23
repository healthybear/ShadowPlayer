## ADDED Requirements

### Requirement: System automatically saves playback position
The system SHALL automatically save the current playback position to persistent storage at regular intervals and on specific events.

#### Scenario: Progress saved every 5 seconds during playback
- **WHEN** video is playing continuously
- **THEN** system saves the current playback position to IndexedDB every 5 seconds

#### Scenario: Progress saved immediately on pause
- **WHEN** user pauses the video
- **THEN** system immediately saves the current playback position to IndexedDB

#### Scenario: Progress saved on video end
- **WHEN** video playback reaches the end
- **THEN** system saves the final position and marks the video as completed

#### Scenario: Progress saved before navigation
- **WHEN** user navigates away from the player page
- **THEN** system saves the current playback position before unloading

### Requirement: System restores playback position on video load
The system SHALL automatically restore the last saved playback position when a user opens a previously watched video.

#### Scenario: User resumes partially watched video
- **WHEN** user opens a video that has saved progress (not completed)
- **THEN** system seeks to the last saved position and displays a notification "Resuming from [timestamp]"

#### Scenario: User opens completed video
- **WHEN** user opens a video marked as completed (progress > 95%)
- **THEN** system starts from the beginning (position 0:00)

#### Scenario: User opens new video
- **WHEN** user opens a video with no saved progress
- **THEN** system starts from the beginning (position 0:00)

### Requirement: System calculates playback completion percentage
The system SHALL calculate and store the completion percentage for each video based on current position and total duration.

#### Scenario: Completion percentage is calculated
- **WHEN** system saves playback progress
- **THEN** system calculates percentage as (currentTime / duration) × 100 and stores it

#### Scenario: Video marked as completed
- **WHEN** playback position exceeds 95% of total duration
- **THEN** system sets the completed flag to true

#### Scenario: Completion percentage displayed in video list
- **WHEN** user views the video library
- **THEN** system displays completion percentage for each video (e.g., "67% complete")

### Requirement: System maintains playback history
The system SHALL record the last played timestamp for each video to enable sorting by recently watched.

#### Scenario: Last played timestamp updated
- **WHEN** user opens a video for playback
- **THEN** system updates the lastPlayedAt timestamp to the current time

#### Scenario: Videos sorted by recently played
- **WHEN** user views the history or recent videos list
- **THEN** system displays videos sorted by lastPlayedAt in descending order (most recent first)

### Requirement: System handles progress for multiple videos independently
The system SHALL maintain separate playback progress records for each video in the library.

#### Scenario: Progress tracked per video
- **WHEN** user watches multiple videos
- **THEN** system maintains independent progress records for each video using videoId as the key

#### Scenario: Switching between videos preserves progress
- **WHEN** user switches from Video A to Video B and back to Video A
- **THEN** system restores the correct saved position for each video

### Requirement: System persists progress across browser sessions
The system SHALL store playback progress in IndexedDB to ensure data persists after browser closure.

#### Scenario: Progress survives browser restart
- **WHEN** user closes the browser and reopens it later
- **THEN** system retrieves saved progress from IndexedDB and restores playback positions

#### Scenario: Progress survives page refresh
- **WHEN** user refreshes the page during video playback
- **THEN** system retrieves the last saved progress and resumes from that position

### Requirement: System provides visual progress indicators
The system SHALL display visual indicators of playback progress in the video list and player interface.

#### Scenario: Progress bar in video card
- **WHEN** user views the video library
- **THEN** each video card displays a progress bar showing completion percentage

#### Scenario: Completed badge displayed
- **WHEN** video completion percentage is 100%
- **THEN** system displays a "Completed" badge on the video card

#### Scenario: Resume indicator in player
- **WHEN** user opens a video with saved progress
- **THEN** system displays a temporary notification showing the resume position
