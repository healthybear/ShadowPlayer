# Implementation Tasks

## 1. Design System Foundation

- [ ] 1.1 Create src/styles/material-tokens.css with all Material Design 3 color, typography, shape, and elevation tokens
- [ ] 1.2 Create src/styles/element-plus-material.scss to map Element Plus CSS variables to Material tokens
- [ ] 1.3 Create src/styles/material-utilities.css with ripple effect, state layer, and transition animation styles
- [ ] 1.4 Update src/styles/main.scss to import material-tokens.css, element-plus-material.scss, and material-utilities.css
- [ ] 1.5 Update uno.config.ts to add Material 3 color utilities under md prefix (bg-md-primary, text-md-on-surface, etc.)
- [ ] 1.6 Update uno.config.ts to add Material 3 timing functions (ease-md-standard, ease-md-emphasized, etc.)
- [ ] 1.7 Update uno.config.ts to add Material 3 durations (duration-md-short, duration-md-medium, etc.)
- [ ] 1.8 Update uno.config.ts to add Material 3 breakpoints (medium: 600px, expanded: 840px, large: 1200px)

## 2. Ripple and Interaction System

- [ ] 2.1 Create src/composables/useMaterialRipple.ts with createRipple function
- [ ] 2.2 Implement ripple DOM element creation with size calculation based on click position
- [ ] 2.3 Implement ripple cleanup on animation end and component unmount
- [ ] 2.4 Add ripple animation keyframes to material-utilities.css
- [ ] 2.5 Test ripple effect on multiple rapid clicks

## 3. Virtual Scrolling Setup

- [ ] 3.1 Install vue-virtual-scroller package via pnpm
- [ ] 3.2 Import vue-virtual-scroller CSS in src/main.ts
- [ ] 3.3 Register VueVirtualScroller plugin in src/main.ts

## 4. Material Base Components

- [ ] 4.1 Create src/components/material/MdCard.vue with elevation and padding props
- [ ] 4.2 Implement MdCard with Material 3 surface colors and medium border radius
- [ ] 4.3 Create src/components/material/MdFab.vue with size prop (small, medium, large)
- [ ] 4.4 Implement MdFab with circular shape, primary container colors, and elevation 3
- [ ] 4.5 Add elevation hover effect to MdFab (level 3 → 4 on hover → 3 on press)
- [ ] 4.6 Integrate ripple effect into MdFab using useMaterialRipple
- [ ] 4.7 Add state layer to MdFab
- [ ] 4.8 Create src/components/material/MdChip.vue with selected prop
- [ ] 4.9 Implement MdChip with outline style (unselected) and filled style (selected)
- [ ] 4.10 Integrate ripple effect and state layer into MdChip
- [ ] 4.11 Create src/components/material/MdTopAppBar.vue with scrolled prop
- [ ] 4.12 Implement MdTopAppBar with fixed positioning, 64px height, and conditional elevation
- [ ] 4.13 Add leading, title, and actions slots to MdTopAppBar

## 5. Player Page Components

- [ ] 5.1 Create src/components/player/VideoPlayer.vue for video display area
- [ ] 5.2 Create src/components/player/SubtitleOverlay.vue for subtitle text overlay on video
- [ ] 5.3 Create src/components/player/PlayerControls.vue for play/pause/progress controls
- [ ] 5.4 Create src/components/player/WordPopup.vue with fixed positioning and scale transition
- [ ] 5.5 Implement WordPopup with MdCard elevation 3 and 256px width
- [ ] 5.6 Create src/components/player/SubtitleList.vue using DynamicScroller
- [ ] 5.7 Configure DynamicScroller with min-item-size 60px and buffer 200px
- [ ] 5.8 Create src/components/player/SubtitleListItem.vue with active prop
- [ ] 5.9 Implement SubtitleListItem with time, text, and translation display
- [ ] 5.10 Add secondary-container background and left border accent for active state
- [ ] 5.11 Integrate ripple effect and state layer into SubtitleListItem

## 6. Home Page Components

- [ ] 6.1 Create src/components/home/UploadCard.vue with MdCard elevation 2
- [ ] 6.2 Implement UploadCard with extra-large border radius (28px)
- [ ] 6.3 Add MdFab to UploadCard for upload action
- [ ] 6.4 Create src/components/home/RecentItem.vue with MdCard elevation 1
- [ ] 6.5 Implement RecentItem with thumbnail, title, and metadata display
- [ ] 6.6 Integrate ripple effect and state layer into RecentItem

## 7. History and Vocabulary Components

- [ ] 7.1 Create src/components/history/HistoryItem.vue with MdCard elevation 1
- [ ] 7.2 Implement HistoryItem with thumbnail and progress display using el-progress
- [ ] 7.3 Integrate ripple effect into HistoryItem
- [ ] 7.4 Create src/components/vocabulary/VocabCard.vue with MdCard elevation 1
- [ ] 7.5 Implement VocabCard with word, definition, and example display
- [ ] 7.6 Integrate ripple effect into VocabCard

## 8. Home Page Refactor

- [ ] 8.1 Refactor src/views/home/index.vue to use UploadCard component
- [ ] 8.2 Refactor src/views/home/index.vue to use RecentItem component for video list
- [ ] 8.3 Remove all SCSS from src/views/home/index.vue
- [ ] 8.4 Implement responsive layout with max-width constraints (100% → 600px → 800px)
- [ ] 8.5 Implement responsive padding (16px → 24px → 32px)
- [ ] 8.6 Replace inline styles with UnoCSS utility classes

## 9. Player Page Refactor

- [ ] 9.1 Refactor src/views/player/index.vue to use VideoPlayer component
- [ ] 9.2 Refactor src/views/player/index.vue to use SubtitleOverlay component
- [ ] 9.3 Refactor src/views/player/index.vue to use PlayerControls component
- [ ] 9.4 Refactor src/views/player/index.vue to use WordPopup component
- [ ] 9.5 Refactor src/views/player/index.vue to use SubtitleList component
- [ ] 9.6 Remove all SCSS from src/views/player/index.vue
- [ ] 9.7 Implement responsive layout with flex-direction (column → row at 840px)
- [ ] 9.8 Implement responsive subtitle list sizing (max-height 40vh → width 320px)
- [ ] 9.9 Replace inline styles with UnoCSS utility classes

## 10. History Page Refactor

- [ ] 10.1 Refactor src/views/history/index.vue to use HistoryItem component
- [ ] 10.2 Remove all SCSS from src/views/history/index.vue
- [ ] 10.3 Replace inline styles with UnoCSS utility classes

## 11. Vocabulary Page Refactor

- [ ] 11.1 Refactor src/views/vocabulary/index.vue to use VocabCard component
- [ ] 11.2 Remove all SCSS from src/views/vocabulary/index.vue
- [ ] 11.3 Replace inline styles with UnoCSS utility classes

## 12. Element Plus Customization

- [ ] 12.1 Add el-button Material 3 styles to element-plus-material.scss (border-radius, font-weight, letter-spacing)
- [ ] 12.2 Customize el-button primary variant with Material primary colors
- [ ] 12.3 Customize el-button plain variant with outline style
- [ ] 12.4 Customize el-button text variant with no border
- [ ] 12.5 Replace el-button hover background change with state layer effect
- [ ] 12.6 Add el-input Material 3 styles to element-plus-material.scss (border, border-radius)
- [ ] 12.7 Customize el-input focus state with 2px primary border
- [ ] 12.8 Remove el-input box-shadow
- [ ] 12.9 Add el-progress Material 3 styles to element-plus-material.scss
- [ ] 12.10 Customize el-progress track with surface-variant color
- [ ] 12.11 Customize el-progress bar with primary color and full border-radius

## 13. AppTopNav Migration

- [ ] 13.1 Refactor src/components/AppTopNav.vue to use MdTopAppBar component
- [ ] 13.2 Remove SCSS from AppTopNav.vue
- [ ] 13.3 Replace inline styles with UnoCSS utility classes

## 14. Cleanup and Verification

- [ ] 14.1 Delete all unused SCSS files from src/views/
- [ ] 14.2 Verify all pages render correctly at 600px breakpoint in DevTools
- [ ] 14.3 Verify all pages render correctly at 840px breakpoint in DevTools
- [ ] 14.4 Verify all pages render correctly at 1200px breakpoint in DevTools
- [ ] 14.5 Test ripple effect on all interactive elements
- [ ] 14.6 Test state layer on all interactive elements
- [ ] 14.7 Test virtual scrolling performance with subtitle list
- [ ] 14.8 Verify all colors use Material 3 tokens
- [ ] 14.9 Verify all border-radius values use Material 3 shape tokens
- [ ] 14.10 Verify all shadows use Material 3 elevation tokens
