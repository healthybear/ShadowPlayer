# Loop Playback

## Purpose

Provides AB loop playback functionality for the video player, allowing users to repeatedly play a specific time range for language learning and practice.

## Requirements

### Requirement: Enable loop playback for subtitle
The system SHALL allow users to enable loop playback for a specific subtitle by clicking it in the subtitle list.

#### Scenario: Click subtitle to enable loop
- **WHEN** user clicks on a subtitle item in the list
- **THEN** loop playback SHALL be enabled with the loop start time set to the subtitle's start time
- **THEN** loop playback SHALL be enabled with the loop end time set to the subtitle's end time
- **THEN** the video SHALL seek to the loop start time
- **THEN** the video SHALL begin playing if it was paused

#### Scenario: Loop is already enabled
- **WHEN** user clicks on a subtitle item while loop playback is already enabled
- **THEN** the loop range SHALL be updated to the new subtitle's time range
- **THEN** the video SHALL seek to the new loop start time

### Requirement: Loop playback behavior
When loop playback is enabled, the system SHALL automatically jump back to the loop start time when playback reaches the loop end time.

#### Scenario: Reach loop end time
- **WHEN** video playback reaches or exceeds the loop end time
- **THEN** the video SHALL immediately seek to the loop start time
- **THEN** playback SHALL continue without pausing
- **THEN** the loop counter SHALL increment by 1

#### Scenario: Infinite loop mode
- **WHEN** loop count is set to 0 (infinite)
- **THEN** the loop SHALL continue indefinitely until manually disabled
- **THEN** the loop counter SHALL continue incrementing

#### Scenario: Limited loop count
- **WHEN** loop count is set to a positive number (e.g., 3)
- **THEN** the loop SHALL repeat for the specified number of times
- **THEN** after completing the final loop, loop playback SHALL be automatically disabled
- **THEN** video playback SHALL continue normally past the loop end time

### Requirement: Disable loop playback
The system SHALL allow users to disable loop playback through explicit user action.

#### Scenario: Click loop toggle button
- **WHEN** user clicks the loop toggle button in the video controls
- **THEN** loop playback SHALL be disabled
- **THEN** the loop state indicator SHALL be hidden
- **THEN** video playback SHALL continue normally

#### Scenario: User seeks outside loop range
- **WHEN** loop playback is enabled and user manually seeks to a time outside the loop range
- **THEN** loop playback SHALL be automatically disabled
- **THEN** the loop state indicator SHALL be hidden

### Requirement: Loop state indicator
The system SHALL display a visual indicator when loop playback is active, showing the loop range and current loop count.

#### Scenario: Loop enabled
- **WHEN** loop playback is enabled
- **THEN** a loop indicator SHALL be displayed in the video controls area
- **THEN** the indicator SHALL show the loop start time and end time
- **THEN** the indicator SHALL show the current loop count (e.g., "Loop 2/5" or "Loop 3/∞")

#### Scenario: Loop disabled
- **WHEN** loop playback is disabled
- **THEN** the loop indicator SHALL be hidden

### Requirement: Loop count configuration
The system SHALL allow users to configure the number of times a loop should repeat.

#### Scenario: Set loop count
- **WHEN** user opens the loop settings menu
- **THEN** user SHALL be able to select from preset loop counts: infinite (0), 3, 5, 10
- **THEN** the selected loop count SHALL be applied to the current loop
- **THEN** the loop counter SHALL reset to 0

#### Scenario: Default loop count
- **WHEN** user enables loop playback without explicitly setting a count
- **THEN** the loop count SHALL default to infinite (0)

### Requirement: Loop control UI
The system SHALL provide UI controls for managing loop playback in the video controls bar.

#### Scenario: Loop toggle button
- **WHEN** viewing the video controls
- **THEN** a loop toggle button SHALL be visible
- **THEN** the button SHALL have an active state when loop is enabled
- **THEN** the button SHALL have an inactive state when loop is disabled

#### Scenario: Loop settings menu
- **WHEN** user clicks the loop settings icon (or long-presses the loop button)
- **THEN** a menu SHALL appear with loop count options
- **THEN** the current loop count SHALL be visually indicated

### Requirement: Loop playback persistence
Loop playback state SHALL NOT persist across page reloads or video changes.

#### Scenario: Reload page
- **WHEN** user reloads the player page while loop playback is active
- **THEN** loop playback SHALL be disabled after reload
- **THEN** video SHALL resume from saved playback progress

#### Scenario: Switch to different video
- **WHEN** user navigates to a different video while loop playback is active
- **THEN** loop playback SHALL be disabled for the new video
- **THEN** loop state SHALL not carry over

### Requirement: Loop playback with keyboard shortcuts
The system SHALL support keyboard shortcuts for loop playback control.

#### Scenario: Toggle loop with keyboard
- **WHEN** user presses the 'L' key
- **THEN** loop playback SHALL be toggled on/off
- **THEN** if enabling loop and no subtitle is active, the system SHALL loop the current 5-second segment

#### Scenario: Keyboard shortcut in input field
- **WHEN** user presses 'L' while focused on an input field or textarea
- **THEN** the keyboard shortcut SHALL NOT trigger
- **THEN** the letter 'L' SHALL be typed normally
