## ADDED Requirements

### Requirement: User can select local video files
The system SHALL allow users to select video files from their local file system using a file picker dialog.

#### Scenario: User selects a valid video file
- **WHEN** user clicks the upload button and selects a valid video file (MP4, WebM, or MKV)
- **THEN** system accepts the file and proceeds to validation

#### Scenario: User selects an invalid file type
- **WHEN** user selects a non-video file (e.g., PDF, image)
- **THEN** system displays an error message "Unsupported file format. Please select MP4, WebM, or MKV files."

#### Scenario: User cancels file selection
- **WHEN** user opens the file picker but cancels without selecting a file
- **THEN** system returns to the previous state without error

### Requirement: System validates uploaded video files
The system SHALL validate video files for format compatibility and size constraints before processing.

#### Scenario: File size is within limit
- **WHEN** user uploads a video file smaller than 2GB
- **THEN** system accepts the file and proceeds to metadata extraction

#### Scenario: File size exceeds limit
- **WHEN** user uploads a video file larger than 2GB
- **THEN** system displays an error message "File size exceeds 2GB limit. Please select a smaller file."

#### Scenario: File format is supported
- **WHEN** user uploads a file with extension .mp4, .webm, or .mkv
- **THEN** system validates the file MIME type matches the extension

### Requirement: System extracts video metadata
The system SHALL extract metadata from uploaded video files including duration, resolution, and file size.

#### Scenario: Metadata extraction succeeds
- **WHEN** system processes a valid video file
- **THEN** system extracts duration (in seconds), resolution (width x height), and file size (in bytes)

#### Scenario: Metadata extraction fails
- **WHEN** system cannot read video metadata (corrupted file)
- **THEN** system displays an error message "Unable to process video file. The file may be corrupted."

### Requirement: System stores small video files in IndexedDB
The system SHALL store video files smaller than 50MB directly in IndexedDB as Blob objects.

#### Scenario: Small file storage succeeds
- **WHEN** user uploads a video file smaller than 50MB
- **THEN** system stores the file as a Blob in IndexedDB with storage type "blob"

#### Scenario: IndexedDB storage fails
- **WHEN** IndexedDB storage operation fails (quota exceeded, permission denied)
- **THEN** system displays an error message "Unable to save video. Storage quota may be exceeded."

### Requirement: System stores large video files using File System Access API
The system SHALL store video files 50MB or larger using the File System Access API by saving a FileSystemFileHandle reference.

#### Scenario: Large file storage with File System Access API
- **WHEN** user uploads a video file 50MB or larger AND browser supports File System Access API
- **THEN** system stores a FileSystemFileHandle reference in IndexedDB with storage type "file-handle"

#### Scenario: File System Access API not supported
- **WHEN** user uploads a video file 50MB or larger AND browser does not support File System Access API
- **THEN** system displays a warning "Large file support requires Chrome or Edge browser. Attempting to store in IndexedDB (may fail for very large files)."

#### Scenario: File System Access API permission denied
- **WHEN** user denies file system access permission
- **THEN** system displays an error message "File system access denied. Please grant permission to store large files."

### Requirement: System displays upload progress
The system SHALL display real-time progress feedback during video file processing and storage.

#### Scenario: Upload progress is displayed
- **WHEN** system is processing a video file
- **THEN** system displays a progress indicator showing current stage (validating, extracting metadata, storing)

#### Scenario: Upload completes successfully
- **WHEN** video file is successfully stored
- **THEN** system displays a success message with options to "Play Now" or "Return to List"

### Requirement: System generates unique identifiers for videos
The system SHALL generate a unique UUID for each uploaded video to serve as its primary identifier.

#### Scenario: UUID generation for new video
- **WHEN** system stores a new video file
- **THEN** system generates a unique UUID and associates it with the video record

#### Scenario: UUID uniqueness is guaranteed
- **WHEN** multiple videos are uploaded in sequence
- **THEN** each video receives a distinct UUID with no collisions
