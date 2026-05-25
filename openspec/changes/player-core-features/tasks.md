## 1. Create Composables

- [x] 1.1 Create `useSubtitleListSync.ts` composable for subtitle list synchronization
- [x] 1.2 Implement `currentSubtitleIndex` computed property in `useSubtitleListSync`
- [x] 1.3 Implement auto-scroll logic with `scrollToItem` API in `useSubtitleListSync`
- [x] 1.4 Add debounce to auto-scroll to prevent performance issues
- [x] 1.5 Create `useLoopPlayback.ts` composable for loop playback control
- [x] 1.6 Implement loop state management (enabled, startTime, endTime, count, currentLoop)
- [x] 1.7 Implement `timeupdate` event listener for loop detection in `useLoopPlayback`
- [x] 1.8 Implement `enableLoop`, `disableLoop`, `toggleLoop` methods
- [x] 1.9 Add logic to disable loop when user seeks outside loop range

## 2. Update VideoPlayerContainer Component

- [x] 2.1 Import and integrate `SubtitleList` component into `VideoPlayerContainer.vue`
- [x] 2.2 Add `useSubtitleListSync` composable to manage subtitle list state
- [x] 2.3 Add `useLoopPlayback` composable to manage loop playback
- [x] 2.4 Create computed property to transform `SubtitleEntry[]` to `SubtitleList` format
- [x] 2.5 Implement `formatTime` utility function (seconds to "MM:SS" or "HH:MM:SS")
- [x] 2.6 Connect subtitle list `@select` event to loop playback logic
- [x] 2.7 Pass `currentSubtitle.id` as `activeId` prop to `SubtitleList`
- [x] 2.8 Add ref to `DynamicScroller` for programmatic scrolling

## 3. Update Player Page Layout

- [x] 3.1 Modify `views/player/index.vue` to support split layout
- [x] 3.2 Implement desktop layout (flexbox: video left, subtitle list right 400px)
- [x] 3.3 Implement mobile layout (flexbox column: video top, subtitle list bottom)
- [x] 3.4 Add responsive breakpoint at 768px using media queries
- [x] 3.5 Set minimum heights for video (40vh) and subtitle list (30vh) on mobile
- [x] 3.6 Ensure subtitle list container has fixed height for virtual scrolling

## 4. Update VideoControls Component

- [x] 4.1 Add loop toggle button to `VideoControls.vue`
- [x] 4.2 Add loop state indicator showing start/end time and loop count
- [x] 4.3 Add loop settings menu with count options (infinite, 3, 5, 10)
- [x] 4.4 Implement visual active state for loop toggle button
- [x] 4.5 Add props for `loopEnabled`, `loopStart`, `loopEnd`, `loopCount`, `currentLoop`
- [x] 4.6 Add emits for `@toggle-loop` and `@set-loop-count`
- [x] 4.7 Style loop indicator with Material Design 3 tokens

## 5. Update Keyboard Shortcuts

- [x] 5.1 Add 'L' key handler to `useKeyboardShortcuts.ts` for loop toggle
- [x] 5.2 Implement fallback loop behavior (loop current 5-second segment if no subtitle active)
- [x] 5.3 Update `VideoPlayerContainer` to connect keyboard shortcut to loop toggle

## 6. Handle Edge Cases

- [x] 6.1 Add "No subtitles available" message when subtitle list is empty
- [x] 6.2 Add upload button in empty state that links to subtitle uploader
- [x] 6.3 Handle case where subtitle has no translation (hide translation row)
- [x] 6.4 Prevent auto-scroll when user manually scrolls (3-second timeout)
- [x] 6.5 Ensure loop is disabled when switching videos or reloading page
- [x] 6.6 Handle loop end time < current time edge case (seek to start immediately)

## 7. Add Educational Comments

- [x] 7.1 Add high-density comments to `useSubtitleListSync.ts` explaining sync logic
- [x] 7.2 Add comments to `useLoopPlayback.ts` explaining loop detection algorithm
- [x] 7.3 Add comments to layout CSS explaining flexbox responsive strategy
- [x] 7.4 Add comments explaining virtual scrolling performance considerations
- [x] 7.5 Document why `timeupdate` is used instead of `setInterval` for loop detection
- [x] 7.6 Add "企业项目经验" comments for key engineering decisions

## 8. Testing and Verification

- [x] 8.1 Test subtitle list display on desktop layout (video left, list right)
- [x] 8.2 Test subtitle list display on mobile layout (video top, list bottom)
- [x] 8.3 Test click subtitle to seek video functionality
- [x] 8.4 Test current subtitle highlighting updates during playback
- [x] 8.5 Test auto-scroll keeps current subtitle visible
- [x] 8.6 Test virtual scrolling performance with 500+ subtitle entries
- [x] 8.7 Test loop playback with infinite loop (count = 0)
- [x] 8.8 Test loop playback with limited count (e.g., 3 loops)
- [x] 8.9 Test loop toggle button enables/disables loop
- [x] 8.10 Test loop indicator displays correct start/end time and count
- [x] 8.11 Test keyboard shortcut 'L' toggles loop
- [x] 8.12 Test loop disables when user seeks outside range
- [x] 8.13 Test empty subtitle list shows "No subtitles available" message
- [x] 8.14 Test subtitle time formatting (MM:SS and HH:MM:SS)
