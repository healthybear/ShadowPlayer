# Material Components Specification

## Purpose

This capability defines the Material Design 3 component library for ShadowPlayer, including base components (Card, FAB, Chip, TopAppBar) and Element Plus customizations.

## Requirements

### Requirement: MdCard Component
The system SHALL provide a Material Design 3 card component with configurable elevation and padding.

#### Scenario: Card renders with default elevation
- **WHEN** MdCard is rendered without elevation prop
- **THEN** card displays with elevation level 1 shadow

#### Scenario: Card renders with custom elevation
- **WHEN** MdCard is rendered with elevation="3"
- **THEN** card displays with elevation level 3 shadow

#### Scenario: Card has Material 3 border radius
- **WHEN** MdCard is rendered
- **THEN** card has 12px border radius (--md-sys-shape-corner-medium)

#### Scenario: Card uses Material 3 surface colors
- **WHEN** MdCard is rendered
- **THEN** card background is --md-sys-color-surface and text is --md-sys-color-on-surface

#### Scenario: Card supports custom padding
- **WHEN** MdCard is rendered with padding prop
- **THEN** card applies the specified padding value

### Requirement: MdFab Component
The system SHALL provide a Material Design 3 floating action button in three sizes (small, medium, large).

#### Scenario: FAB renders with default size
- **WHEN** MdFab is rendered without size prop
- **THEN** FAB is 56x56px (medium size)

#### Scenario: FAB renders with small size
- **WHEN** MdFab is rendered with size="small"
- **THEN** FAB is 40x40px

#### Scenario: FAB renders with large size
- **WHEN** MdFab is rendered with size="large"
- **THEN** FAB is 96x96px

#### Scenario: FAB has circular shape
- **WHEN** MdFab is rendered
- **THEN** FAB has border-radius of 50% (perfectly circular)

#### Scenario: FAB uses primary container colors
- **WHEN** MdFab is rendered
- **THEN** FAB background is --md-sys-color-primary-container and icon is --md-sys-color-on-primary-container

#### Scenario: FAB has elevation 3 by default
- **WHEN** MdFab is rendered
- **THEN** FAB displays with elevation level 3 shadow

#### Scenario: FAB elevation increases on hover
- **WHEN** user hovers over FAB
- **THEN** FAB elevation changes to level 4

#### Scenario: FAB elevation returns on press
- **WHEN** user presses FAB
- **THEN** FAB elevation returns to level 3

#### Scenario: FAB has ripple effect
- **WHEN** user clicks FAB
- **THEN** ripple animation plays from click position

#### Scenario: FAB has state layer
- **WHEN** user interacts with FAB
- **THEN** state layer overlay appears with appropriate opacity

### Requirement: MdChip Component
The system SHALL provide a Material Design 3 filter chip component with selected state.

#### Scenario: Chip renders in unselected state
- **WHEN** MdChip is rendered without selected prop
- **THEN** chip has outline border and no background fill

#### Scenario: Chip renders in selected state
- **WHEN** MdChip is rendered with selected="true"
- **THEN** chip has filled background with --md-sys-color-secondary-container

#### Scenario: Chip has small border radius
- **WHEN** MdChip is rendered
- **THEN** chip has 8px border radius (--md-sys-shape-corner-small)

#### Scenario: Chip has ripple effect
- **WHEN** user clicks chip
- **THEN** ripple animation plays from click position

#### Scenario: Chip has state layer
- **WHEN** user hovers over chip
- **THEN** state layer overlay appears

#### Scenario: Chip emits toggle event
- **WHEN** user clicks chip
- **THEN** chip emits update:selected event with new state

### Requirement: MdTopAppBar Component
The system SHALL provide a Material Design 3 top app bar component.

#### Scenario: App bar has fixed positioning
- **WHEN** MdTopAppBar is rendered
- **THEN** app bar is fixed at top of viewport

#### Scenario: App bar has correct height
- **WHEN** MdTopAppBar is rendered
- **THEN** app bar height is 64px

#### Scenario: App bar uses surface colors
- **WHEN** MdTopAppBar is rendered
- **THEN** app bar background is --md-sys-color-surface and text is --md-sys-color-on-surface

#### Scenario: App bar has elevation 0 by default
- **WHEN** MdTopAppBar is rendered without scrolled state
- **THEN** app bar has no shadow (elevation level 0)

#### Scenario: App bar gains elevation when scrolled
- **WHEN** page is scrolled and scrolled prop is true
- **THEN** app bar displays with elevation level 2 shadow

#### Scenario: App bar supports leading icon slot
- **WHEN** MdTopAppBar is rendered with leading slot content
- **THEN** leading icon appears on the left side

#### Scenario: App bar supports title slot
- **WHEN** MdTopAppBar is rendered with title slot content
- **THEN** title appears in the center

#### Scenario: App bar supports trailing actions slot
- **WHEN** MdTopAppBar is rendered with actions slot content
- **THEN** action buttons appear on the right side

### Requirement: Element Plus Button Customization
The system SHALL customize Element Plus buttons to match Material Design 3 style.

#### Scenario: Primary button uses Material colors
- **WHEN** el-button with type="primary" is rendered
- **THEN** button background is --md-sys-color-primary and text is --md-sys-color-on-primary

#### Scenario: Primary button has Material border radius
- **WHEN** el-button with type="primary" is rendered
- **THEN** button has 16px border radius (--md-sys-shape-corner-large)

#### Scenario: Primary button has Material typography
- **WHEN** el-button with type="primary" is rendered
- **THEN** button text has font-weight 500 and letter-spacing 0.1px

#### Scenario: Plain button uses outline style
- **WHEN** el-button with plain prop is rendered
- **THEN** button has transparent background with --md-sys-color-outline border

#### Scenario: Text button has no border
- **WHEN** el-button with text prop is rendered
- **THEN** button has no border and --md-sys-color-primary text

#### Scenario: Button hover uses state layer
- **WHEN** user hovers over button
- **THEN** button shows 8% opacity overlay instead of changing background color

### Requirement: Element Plus Input Customization
The system SHALL customize Element Plus inputs to match Material Design 3 outlined text field style.

#### Scenario: Input has Material border
- **WHEN** el-input is rendered
- **THEN** input has 1px solid --md-sys-color-outline border

#### Scenario: Input has small border radius
- **WHEN** el-input is rendered
- **THEN** input has 4px border radius (--md-sys-shape-corner-extra-small)

#### Scenario: Input border darkens on hover
- **WHEN** user hovers over input
- **THEN** border color changes to --md-sys-color-on-surface

#### Scenario: Input border thickens on focus
- **WHEN** user focuses input
- **THEN** border width increases to 2px and color changes to --md-sys-color-primary

#### Scenario: Input has no box shadow
- **WHEN** el-input is rendered or focused
- **THEN** input has no box-shadow (Material uses border only)

### Requirement: Element Plus Progress Customization
The system SHALL customize Element Plus progress bars to match Material Design 3 style.

#### Scenario: Progress track uses surface variant
- **WHEN** el-progress is rendered
- **THEN** track background is --md-sys-color-surface-variant

#### Scenario: Progress bar uses primary color
- **WHEN** el-progress is rendered
- **THEN** progress bar background is --md-sys-color-primary

#### Scenario: Progress has full border radius
- **WHEN** el-progress is rendered
- **THEN** both track and bar have 9999px border radius (--md-sys-shape-corner-full)
