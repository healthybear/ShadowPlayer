## ADDED Requirements

### Requirement: User can upload external subtitle files
The system SHALL allow users to upload subtitle files in SRT or VTT format and associate them with videos.

#### Scenario: User uploads SRT subtitle file
- **WHEN** user selects an SRT file through the subtitle upload interface
- **THEN** system accepts the file and associates it with the current video

#### Scenario: User uploads VTT subtitle file
- **WHEN** user selects a VTT file through the subtitle upload interface
- **THEN** system accepts the file and associates it with the current video

#### Scenario: User uploads invalid subtitle file
- **WHEN** user selects a file that is not SRT or VTT format
- **THEN** system displays an error message "Unsupported subtitle format. Please upload SRT or VTT files."

#### Scenario: User uploads subtitle for video without subtitles
- **WHEN** user uploads a subtitle file for a video that has no existing subtitles
- **THEN** system stores the subtitle and automatically enables subtitle display

### Requirement: System parses SRT subtitle format
The system SHALL parse SRT (SubRip) subtitle files and extract timing and text information.

#### Scenario: Valid SRT file is parsed
- **WHEN** system receives a valid SRT file
- **THEN** system extracts all subtitle entries with index, start time, end time, and text content

#### Scenario: SRT file with malformed timestamps
- **WHEN** system encounters invalid timestamp format in SRT file
- **THEN** system displays an error message "Invalid subtitle file. Timestamp format is incorrect."

#### Scenario: SRT file with missing sequence numbers
- **WHEN** SRT file has missing or non-sequential index numbers
- **THEN** system parses the file and assigns sequential indices automatically

### Requirement: System parses VTT subtitle format
The system SHALL parse VTT (WebVTT) subtitle files and extract timing and text information.

#### Scenario: Valid VTT file is parsed
- **WHEN** system receives a valid VTT file starting with "WEBVTT"
- **THEN** system extracts all subtitle cues with start time, end time, and text content

#### Scenario: VTT file without WEBVTT header
- **WHEN** system receives a VTT file missing the "WEBVTT" header
- **THEN** system displays an error message "Invalid VTT file. Missing WEBVTT header."

#### Scenario: VTT file with cue settings
- **WHEN** VTT file contains cue settings (position, alignment, etc.)
- **THEN** system parses the cues and ignores unsupported settings

### Requirement: System synchronizes subtitles with video playback
The system SHALL display the correct subtitle text based on the current video playback time with high precision.

#### Scenario: Subtitle displayed at correct time
- **WHEN** video playback time falls within a subtitle entry's time range (startTime ≤ currentTime ≤ endTime)
- **THEN** system displays the corresponding subtitle text

#### Scenario: Subtitle hidden between entries
- **WHEN** video playback time does not match any subtitle entry's time range
- **THEN** system hides the subtitle display

#### Scenario: Subtitle updates during playback
- **WHEN** video is playing and crosses subtitle boundaries
- **THEN** system updates the displayed subtitle within 50ms of the timestamp change

#### Scenario: Subtitle updates during seeking
- **WHEN** user seeks to a new position in the video
- **THEN** system immediately displays the correct subtitle for the new position

### Requirement: System uses efficient subtitle lookup algorithm
The system SHALL use binary search to locate the current subtitle entry for optimal performance.

#### Scenario: Binary search finds subtitle efficiently
- **WHEN** system needs to find the current subtitle for a given timestamp
- **THEN** system uses binary search algorithm with O(log n) time complexity

#### Scenario: Subtitle lookup handles edge cases
- **WHEN** current time is before the first subtitle or after the last subtitle
- **THEN** system returns null and hides subtitle display without errors

### Requirement: User can toggle subtitle visibility
The system SHALL allow users to show or hide subtitles without removing the subtitle file.

#### Scenario: User hides subtitles
- **WHEN** user clicks the subtitle toggle button or presses C key while subtitles are visible
- **THEN** system hides the subtitle display and updates the button state

#### Scenario: User shows subtitles
- **WHEN** user clicks the subtitle toggle button or presses C key while subtitles are hidden
- **THEN** system shows the subtitle display and updates the button state

#### Scenario: Subtitle toggle state persists
- **WHEN** user toggles subtitle visibility and then seeks or pauses
- **THEN** system maintains the visibility state (hidden subtitles stay hidden)

### Requirement: System displays subtitles with readable styling
The system SHALL render subtitles with clear, readable styling including appropriate font size, color, and background.

#### Scenario: Subtitle text is readable
- **WHEN** subtitle is displayed
- **THEN** system renders text with white color, semi-transparent black background, and appropriate font size (minimum 16px)

#### Scenario: Subtitle positioned correctly
- **WHEN** subtitle is displayed
- **THEN** system positions the subtitle at the bottom center of the video, with padding from the edge

#### Scenario: Multi-line subtitles are supported
- **WHEN** subtitle entry contains line breaks
- **THEN** system displays the subtitle as multiple lines with proper spacing

### Requirement: System stores subtitle data in IndexedDB
The system SHALL persist subtitle data in IndexedDB associated with the corresponding video.

#### Scenario: Subtitle saved to database
- **WHEN** user uploads a subtitle file
- **THEN** system parses the file, stores all entries in IndexedDB with a unique subtitle ID and videoId reference

#### Scenario: Subtitle loaded from database
- **WHEN** user opens a video that has associated subtitles
- **THEN** system retrieves the subtitle entries from IndexedDB and prepares them for synchronization

#### Scenario: Multiple subtitles per video
- **WHEN** video has multiple subtitle files (different languages)
- **THEN** system stores each subtitle with a unique ID and allows user to select which one to display

### Requirement: System validates subtitle timing consistency
The system SHALL validate that subtitle timestamps are in chronological order and do not have invalid ranges.

#### Scenario: Subtitle timestamps are chronological
- **WHEN** system parses a subtitle file
- **THEN** system validates that each entry's startTime is less than its endTime

#### Scenario: Subtitle entries are sequential
- **WHEN** system parses a subtitle file
- **THEN** system validates that entries are in chronological order (each entry's startTime ≥ previous entry's startTime)

#### Scenario: Invalid timing detected
- **WHEN** subtitle file contains entries with endTime < startTime or negative timestamps
- **THEN** system displays a warning "Subtitle file contains invalid timestamps. Some entries may not display correctly."
