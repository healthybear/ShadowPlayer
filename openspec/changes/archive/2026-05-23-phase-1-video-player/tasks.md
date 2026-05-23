## 1. Project Setup and Dependencies

- [x] 1.1 Install Dexie.js for IndexedDB management (`pnpm add dexie`)
- [x] 1.2 Install UUID library for generating unique IDs (`pnpm add uuid` and `pnpm add -D @types/uuid`)
- [x] 1.3 Create database schema file at `src/db/schema.ts` with Video, Subtitle, and PlaybackProgress interfaces
- [x] 1.4 Initialize Dexie database instance with proper stores and indexes

## 2. Utility Functions

- [x] 2.1 Create subtitle parser utility at `src/utils/subtitle-parser.ts` with SRT and VTT parsing functions
- [x] 2.2 Create video validator utility at `src/utils/video-validator.ts` for file format and size validation
- [x] 2.3 Add timestamp parsing functions for subtitle time conversion
- [x] 2.4 Add binary search function for efficient subtitle lookup

## 3. Core Composables

- [x] 3.1 Create `src/composables/useVideoStorage.ts` with upload, retrieve, and delete functions
- [x] 3.2 Implement hybrid storage logic (IndexedDB for small files, File System Access API for large files)
- [x] 3.3 Create `src/composables/useVideoPlayer.ts` with play, pause, seek, volume, and speed controls
- [x] 3.4 Create `src/composables/useSubtitle.ts` with subtitle loading, synchronization, and binary search
- [x] 3.5 Create `src/composables/usePlaybackProgress.ts` with auto-save and restore functionality
- [x] 3.6 Create `src/composables/useKeyboardShortcuts.ts` for player keyboard controls

## 4. Video Upload Components

- [x] 4.1 Create `src/components/home/VideoUploader.vue` with file picker and drag-drop support
- [x] 4.2 Add file validation (format, size) with user-friendly error messages
- [x] 4.3 Add upload progress indicator showing current processing stage
- [x] 4.4 Implement metadata extraction (duration, resolution) using video element
- [x] 4.5 Add success/error notifications with action buttons (Play Now, Return to List)
- [x] 4.6 Create `src/components/home/VideoCard.vue` for displaying video thumbnails and metadata
- [x] 4.7 Create `src/components/home/VideoList.vue` with grid layout and progress indicators

## 5. Video Player Components

- [x] 5.1 Create `src/components/player/VideoPlayer.vue` as main player container with HTML5 video element
- [x] 5.2 Create `src/components/player/VideoControls.vue` with play/pause, seek, volume, speed, and fullscreen buttons
- [x] 5.3 Create `src/components/player/VideoProgress.vue` with draggable progress bar and time display
- [x] 5.4 Create `src/components/player/VolumeControl.vue` with slider and mute toggle
- [x] 5.5 Create `src/components/player/PlaybackSpeed.vue` with speed selection menu (0.5x to 2x)
- [x] 5.6 Integrate keyboard shortcuts into VideoPlayer component
- [x] 5.7 Add fullscreen API integration with browser compatibility checks

## 6. Subtitle Components

- [x] 6.1 Create `src/components/player/SubtitleUploader.vue` for uploading SRT/VTT files
- [x] 6.2 Add subtitle file validation and parsing with error handling
- [x] 6.3 Create `src/components/player/SubtitleDisplay.vue` with styled subtitle rendering
- [x] 6.4 Implement subtitle synchronization using timeupdate event and binary search
- [x] 6.5 Add subtitle visibility toggle (button and C key shortcut)
- [x] 6.6 Add subtitle styling (white text, semi-transparent background, proper positioning)

## 7. Playback Progress Features

- [x] 7.1 Implement auto-save progress every 5 seconds using debounced function
- [x] 7.2 Implement immediate save on pause and before navigation
- [x] 7.3 Add progress restoration on video load with resume notification
- [x] 7.4 Calculate and store completion percentage (currentTime / duration × 100)
- [x] 7.5 Mark videos as completed when progress exceeds 95%
- [x] 7.6 Display progress bars and completion badges in VideoCard component

## 8. Views and Routing

- [x] 8.1 Create `src/views/HomeView.vue` with VideoUploader and VideoList components
- [x] 8.2 Create `src/views/PlayerView.vue` integrating VideoPlayer and subtitle components
- [x] 8.3 Add route for player view with video ID parameter (`/player/:id`)
- [x] 8.4 Implement navigation between home and player views
- [x] 8.5 Add history view showing recently played videos sorted by lastPlayedAt

## 9. Error Handling and Edge Cases

- [x] 9.1 Add error handling for video load failures (missing file, corrupted, unsupported codec)
- [x] 9.2 Add error handling for IndexedDB quota exceeded
- [x] 9.3 Add fallback for browsers without File System Access API support
- [x] 9.4 Handle subtitle parsing errors with user-friendly messages
- [x] 9.5 Prevent keyboard shortcuts from triggering when typing in input fields

## 10. Testing and Validation

- [x] 10.1 Test video upload with files of various sizes (< 50MB and ≥ 50MB)
- [x] 10.2 Test video playback with different formats (MP4, WebM, MKV)
- [x] 10.3 Test subtitle synchronization accuracy (verify < 100ms delay)
- [x] 10.4 Test playback progress save and restore across browser sessions
- [x] 10.5 Test all keyboard shortcuts (Space, arrows, F, M, C, <, >)
- [x] 10.6 Test fullscreen mode on different browsers
- [x] 10.7 Verify progress indicators and completion badges display correctly

## 11. UI Polish and Accessibility

- [x] 11.1 Apply Material Design 3 styling to all components using Element Plus
- [x] 11.2 Ensure all interactive elements have proper hover and focus states
- [x] 11.3 Add loading states for video upload and playback initialization
- [x] 11.4 Add ARIA labels for player controls (play/pause, volume, progress bar)
- [x] 11.5 Ensure keyboard navigation works for all interactive elements
- [x] 11.6 Test responsive layout on different screen sizes

## 12. Performance Optimization

- [x] 12.1 Use `preload="metadata"` on video element to optimize initial load
- [x] 12.2 Implement requestAnimationFrame for smooth subtitle rendering
- [x] 12.3 Add debouncing to progress save function (5 second interval)
- [x] 12.4 Optimize IndexedDB queries using proper indexes
- [x] 12.5 Verify memory usage stays reasonable during playback (< 500MB for 1080p)
