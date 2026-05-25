## ADDED Requirements

### Requirement: Display subtitle list in player page
The player page SHALL display a subtitle list alongside the video player, showing all subtitles for the current video.

#### Scenario: Desktop layout
- **WHEN** user opens the player page on a desktop device (viewport width >= 768px)
- **THEN** the subtitle list SHALL be displayed on the right side of the video player with a fixed width of 400px

#### Scenario: Mobile layout
- **WHEN** user opens the player page on a mobile device (viewport width < 768px)
- **THEN** the subtitle list SHALL be displayed below the video player in a vertical layout

#### Scenario: No subtitles available
- **WHEN** user opens a video that has no subtitles uploaded
- **THEN** the subtitle list area SHALL display a message "No subtitles available" with an upload button

### Requirement: Click subtitle to seek video
The system SHALL allow users to jump to a specific time in the video by clicking a subtitle in the list.

#### Scenario: Click subtitle item
- **WHEN** user clicks on a subtitle item in the list
- **THEN** the video SHALL seek to the start time of that subtitle
- **THEN** the video SHALL continue playing if it was already playing, or remain paused if it was paused

### Requirement: Highlight current subtitle
The system SHALL highlight the currently playing subtitle in the subtitle list.

#### Scenario: Subtitle becomes active
- **WHEN** video playback reaches the start time of a subtitle
- **THEN** that subtitle item SHALL be visually highlighted with a distinct background color and left border
- **THEN** the previously highlighted subtitle SHALL return to normal appearance

#### Scenario: No active subtitle
- **WHEN** video playback is at a time where no subtitle is defined
- **THEN** no subtitle item SHALL be highlighted

### Requirement: Auto-scroll to current subtitle
The system SHALL automatically scroll the subtitle list to keep the currently playing subtitle visible.

#### Scenario: Current subtitle is out of view
- **WHEN** video playback reaches a new subtitle that is not currently visible in the subtitle list viewport
- **THEN** the subtitle list SHALL automatically scroll to bring that subtitle into view
- **THEN** the scroll SHALL be smooth and not disrupt user's reading experience

#### Scenario: User manually scrolls list
- **WHEN** user manually scrolls the subtitle list to view other subtitles
- **THEN** auto-scroll SHALL be temporarily disabled for 3 seconds
- **THEN** auto-scroll SHALL resume after the timeout period

### Requirement: Virtual scrolling performance
The subtitle list SHALL use virtual scrolling to maintain performance with large subtitle files.

#### Scenario: Large subtitle file
- **WHEN** a video has more than 100 subtitle entries
- **THEN** the subtitle list SHALL only render visible items plus a buffer zone
- **THEN** scrolling SHALL remain smooth with no visible lag

#### Scenario: Dynamic item heights
- **WHEN** subtitle items have varying text lengths
- **THEN** the virtual scroller SHALL dynamically measure and adjust item heights
- **THEN** scroll position SHALL remain accurate

### Requirement: Subtitle list data format
The subtitle list SHALL display formatted time, text, and optional translation for each subtitle entry.

#### Scenario: Format time display
- **WHEN** rendering a subtitle item
- **THEN** the start time SHALL be formatted as "MM:SS" for durations under 1 hour
- **THEN** the start time SHALL be formatted as "HH:MM:SS" for durations 1 hour or longer

#### Scenario: Display subtitle text
- **WHEN** rendering a subtitle item
- **THEN** the original subtitle text SHALL be displayed prominently
- **THEN** if a translation exists, it SHALL be displayed below the original text in a smaller, secondary color

#### Scenario: Missing translation
- **WHEN** a subtitle entry has no translation field
- **THEN** only the original text SHALL be displayed
- **THEN** no empty translation area SHALL be shown
