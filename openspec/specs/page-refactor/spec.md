# Page Refactor Specification

## Purpose

This capability defines the refactoring of ShadowPlayer pages into component-based architecture with responsive layouts, virtual scrolling, and Material Design 3 styling.

## Requirements

### Requirement: Home Page Component Structure
The system SHALL refactor the Home page into reusable components with responsive layout.

#### Scenario: Home page uses UploadCard component
- **WHEN** Home page is rendered
- **THEN** upload section is rendered using UploadCard component

#### Scenario: Home page uses RecentItem component
- **WHEN** Home page displays recent videos
- **THEN** each video is rendered using RecentItem component

#### Scenario: Home page has responsive max-width
- **WHEN** viewport width is less than 600px
- **THEN** main content has 100% width with 16px padding

#### Scenario: Home page constrains width on medium screens
- **WHEN** viewport width is 600px or more
- **THEN** main content has max-width 600px with 24px padding

#### Scenario: Home page constrains width on large screens
- **WHEN** viewport width is 840px or more
- **THEN** main content has max-width 800px with 32px padding

### Requirement: Player Page Component Structure
The system SHALL refactor the Player page into specialized components with responsive layout and virtual scrolling.

#### Scenario: Player page uses VideoPlayer component
- **WHEN** Player page is rendered
- **THEN** video section is rendered using VideoPlayer component

#### Scenario: Player page uses SubtitleOverlay component
- **WHEN** Player page is rendered
- **THEN** subtitle overlay is rendered using SubtitleOverlay component

#### Scenario: Player page uses WordPopup component
- **WHEN** Player page is rendered
- **THEN** word lookup popup is rendered using WordPopup component

#### Scenario: Player page uses PlayerControls component
- **WHEN** Player page is rendered
- **THEN** video controls are rendered using PlayerControls component

#### Scenario: Player page uses SubtitleList component
- **WHEN** Player page is rendered
- **THEN** subtitle list is rendered using SubtitleList component with virtual scrolling

#### Scenario: Player page uses vertical layout on small screens
- **WHEN** viewport width is less than 840px
- **THEN** video and subtitle list are stacked vertically

#### Scenario: Player page uses horizontal layout on large screens
- **WHEN** viewport width is 840px or more
- **THEN** video and subtitle list are side-by-side

#### Scenario: Subtitle list is constrained on small screens
- **WHEN** viewport width is less than 840px
- **THEN** subtitle list has max-height of 40vh

#### Scenario: Subtitle list has fixed width on large screens
- **WHEN** viewport width is 840px or more
- **THEN** subtitle list has width of 320px with no max-height

### Requirement: SubtitleList Virtual Scrolling
The system SHALL implement virtual scrolling for subtitle list using DynamicScroller with dynamic item heights.

#### Scenario: SubtitleList uses DynamicScroller
- **WHEN** SubtitleList is rendered with subtitles
- **THEN** subtitles are rendered using vue-virtual-scroller DynamicScroller component

#### Scenario: SubtitleList sets minimum item size
- **WHEN** DynamicScroller is configured
- **THEN** min-item-size is set to 60px

#### Scenario: SubtitleList sets buffer size
- **WHEN** DynamicScroller is configured
- **THEN** buffer is set to 200px for smooth scrolling

#### Scenario: SubtitleList wraps items in DynamicScrollerItem
- **WHEN** each subtitle is rendered
- **THEN** it is wrapped in DynamicScrollerItem component

#### Scenario: SubtitleList handles dynamic heights
- **WHEN** subtitle text length varies
- **THEN** DynamicScroller automatically adjusts item heights

### Requirement: SubtitleListItem Component
The system SHALL provide a SubtitleListItem component with active state and Material interactions.

#### Scenario: Subtitle item displays time
- **WHEN** SubtitleListItem is rendered
- **THEN** subtitle timestamp is displayed in header

#### Scenario: Subtitle item displays text
- **WHEN** SubtitleListItem is rendered
- **THEN** original subtitle text is displayed

#### Scenario: Subtitle item displays translation
- **WHEN** SubtitleListItem is rendered
- **THEN** translated subtitle text is displayed

#### Scenario: Active subtitle has container background
- **WHEN** SubtitleListItem active prop is true
- **THEN** background is --md-sys-color-secondary-container

#### Scenario: Active subtitle has left border accent
- **WHEN** SubtitleListItem active prop is true
- **THEN** 4px left border with --md-sys-color-secondary is displayed

#### Scenario: Subtitle item has state layer
- **WHEN** user hovers over subtitle item
- **THEN** state layer overlay appears

#### Scenario: Subtitle item has ripple effect
- **WHEN** user clicks subtitle item
- **THEN** ripple animation plays from click position

### Requirement: History Page Component Structure
The system SHALL refactor the History page to use HistoryItem component.

#### Scenario: History page uses HistoryItem component
- **WHEN** History page displays video history
- **THEN** each history entry is rendered using HistoryItem component

#### Scenario: HistoryItem uses MdCard
- **WHEN** HistoryItem is rendered
- **THEN** it is wrapped in MdCard component with elevation 1

#### Scenario: HistoryItem displays thumbnail
- **WHEN** HistoryItem is rendered
- **THEN** video thumbnail is displayed

#### Scenario: HistoryItem displays progress
- **WHEN** HistoryItem is rendered
- **THEN** watch progress is displayed using el-progress

#### Scenario: HistoryItem has ripple effect
- **WHEN** user clicks history item
- **THEN** ripple animation plays from click position

### Requirement: Vocabulary Page Component Structure
The system SHALL refactor the Vocabulary page to use VocabCard component.

#### Scenario: Vocabulary page uses VocabCard component
- **WHEN** Vocabulary page displays words
- **THEN** each word is rendered using VocabCard component

#### Scenario: VocabCard uses MdCard
- **WHEN** VocabCard is rendered
- **THEN** it is wrapped in MdCard component with elevation 1

#### Scenario: VocabCard displays word
- **WHEN** VocabCard is rendered
- **THEN** vocabulary word is displayed prominently

#### Scenario: VocabCard displays definition
- **WHEN** VocabCard is rendered
- **THEN** word definition is displayed

#### Scenario: VocabCard displays example
- **WHEN** VocabCard is rendered
- **THEN** example sentence is displayed

#### Scenario: VocabCard has ripple effect
- **WHEN** user clicks vocab card
- **THEN** ripple animation plays from click position

### Requirement: UploadCard Component
The system SHALL provide an UploadCard component for the Home page upload section.

#### Scenario: UploadCard uses MdCard
- **WHEN** UploadCard is rendered
- **THEN** it is wrapped in MdCard component with elevation 2

#### Scenario: UploadCard has extra-large border radius
- **WHEN** UploadCard is rendered
- **THEN** card has 28px border radius (--md-sys-shape-corner-extra-large)

#### Scenario: UploadCard displays upload icon
- **WHEN** UploadCard is rendered
- **THEN** upload icon is displayed prominently

#### Scenario: UploadCard displays title
- **WHEN** UploadCard is rendered
- **THEN** "Upload Video" title is displayed

#### Scenario: UploadCard displays description
- **WHEN** UploadCard is rendered
- **THEN** upload instructions are displayed

#### Scenario: UploadCard has MdFab
- **WHEN** UploadCard is rendered
- **THEN** floating action button is displayed for upload action

### Requirement: RecentItem Component
The system SHALL provide a RecentItem component for displaying recent videos on Home page.

#### Scenario: RecentItem uses MdCard
- **WHEN** RecentItem is rendered
- **THEN** it is wrapped in MdCard component with elevation 1

#### Scenario: RecentItem displays thumbnail
- **WHEN** RecentItem is rendered
- **THEN** video thumbnail is displayed

#### Scenario: RecentItem displays title
- **WHEN** RecentItem is rendered
- **THEN** video title is displayed

#### Scenario: RecentItem displays metadata
- **WHEN** RecentItem is rendered
- **THEN** video duration and date are displayed

#### Scenario: RecentItem has ripple effect
- **WHEN** user clicks recent item
- **THEN** ripple animation plays from click position

#### Scenario: RecentItem has state layer
- **WHEN** user hovers over recent item
- **THEN** state layer overlay appears

### Requirement: WordPopup Component
The system SHALL provide a WordPopup component with fixed positioning for word lookup.

#### Scenario: WordPopup has fixed position
- **WHEN** WordPopup is rendered
- **THEN** popup is positioned at bottom 35%, left calc(50% + 64px)

#### Scenario: WordPopup has fixed width
- **WHEN** WordPopup is rendered
- **THEN** popup width is 256px

#### Scenario: WordPopup uses MdCard
- **WHEN** WordPopup is rendered
- **THEN** it is wrapped in MdCard component with elevation 3

#### Scenario: WordPopup displays word
- **WHEN** WordPopup is rendered with word data
- **THEN** selected word is displayed prominently

#### Scenario: WordPopup displays definition
- **WHEN** WordPopup is rendered with word data
- **THEN** word definition is displayed

#### Scenario: WordPopup displays pronunciation
- **WHEN** WordPopup is rendered with word data
- **THEN** phonetic pronunciation is displayed

#### Scenario: WordPopup has scale transition
- **WHEN** WordPopup appears or disappears
- **THEN** scale transition animation plays with Material timing

### Requirement: SCSS Removal
The system SHALL remove all SCSS files and migrate styles to UnoCSS utilities and CSS variables.

#### Scenario: Home page has no scoped SCSS
- **WHEN** Home page component is inspected
- **THEN** no `<style scoped lang="scss">` block exists

#### Scenario: Player page has no scoped SCSS
- **WHEN** Player page component is inspected
- **THEN** no `<style scoped lang="scss">` block exists

#### Scenario: History page has no scoped SCSS
- **WHEN** History page component is inspected
- **THEN** no `<style scoped lang="scss">` block exists

#### Scenario: Vocabulary page has no scoped SCSS
- **WHEN** Vocabulary page component is inspected
- **THEN** no `<style scoped lang="scss">` block exists

#### Scenario: All page components use UnoCSS
- **WHEN** page components are inspected
- **THEN** styling is done via UnoCSS utility classes

#### Scenario: All page components use CSS variables
- **WHEN** page components need custom styles
- **THEN** Material Design tokens (--md-sys-*) are used
