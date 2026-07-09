Connect via the Figma MCP to https://www.figma.com/design/ERtCJDYHwv062jearypfP7/Settlement-Redesign?node-id=6152-549

## 01 Read the Variables in the figma file

The structure is:
Variables

- Collections
  - Color Primitives: primitive color values like "Red"
- Theme
  - Color Variables used in components like btn/primary/hover/bg (these map to primitives)
  - There are 2 modes we will use, Light and Dark - these will map to the CSS using modern theming
- Viewport
  - Variables used in components related to sizing and typography and structure
  - There are 3 modes we will use, Desktop, Tablet, and Phone.
  - The Phone values will be used by default (this is a 'mobile-first' approach) The values for Tablet and Desktop will be in media queries in the CSS

## 02 Writing the CSS variables

The SCSS files are in /src/css/variables

## 03 Write the Color Primitives

In `/src/css/variables/_01_color_primitives.scss`

in a ::root {} declaration create a css variable for every color primitive found in the figma variables

## 04 Write the Theme Variables

In `/src/css/variables/_02_theme.scss`

in a ::root {} declaration create a css variable for every variable found
in the Collections/Theme variables

name the variable in this format: --{group}-{name}
if the variable is nested like btn/primary/default it would be --{group}-{group}-name --btn-primary-default

the value of the variable will use the light-dark() css function. Get the first value from the Light mode and second value from the Dark mode. light-dark({Light mode value}, {Dark mode value})

NOTE: The html element uses color-scheme: light dark;

## 05 Write the Viewport Variables

In `/src/css/variables/_03_viewport.scss`

Get the values of viewport-break-point from the Desktop, and Tablet modes.
define SCSS variables for these like $bp-desktop and $bp-tablet (in px)
we will use these in media queries in this file

in a ::root {} declaration create a css variable for every variable found in the Collections/Viewport variables
name the variable in this format: --{group}-{name}
if the variable is nested it would be --{group}-{group}-name
in this ::root {} declaration use the value from the Phone mode
Note: if a variable's name segment starts with 'figma-' (e.g. heading1/figma-font-weight) you can ignore it, this is only used for the figma file

Create a media query `@media (min-width: $bp-tablet)` and put a ::root {} declaration inside of it
here you will use the same variable names but using the value from the Tablet mode.
Only include the variables whose Tablet value differs from the Phone value — the others already cascade from the default ::root.

Create a media query `@media (min-width: $bp-desktop)` and put a ::root {} declaration inside of it
here you will use the same variable names but using the value from the Desktop mode.
Only include the variables whose Desktop value differs from the Tablet value.

### Units for numeric (FLOAT) values

Figma stores numbers without units. Convert as follows:

- font-size, spacing, sizes, border-radius: convert px to rem (divide by 16). e.g. 18 -> 1.125rem
- line-height and font-weight: unitless, use the raw number (e.g. 1.375, 650). Do not round away precision.
- letter-spacing: numeric values are em, e.g. 0.15 -> 0.15em (STRING values like "0.15em" already carry the unit)
- the $bp-\* SCSS breakpoint variables stay in px

### Other value rules

- STRING font-family values get quoted: "Fraunces"
- other STRING values (uppercase, 0.15em) are used as-is, unquoted
- variables aliased to another variable become var() references: link/font-size -> var(--small-text-font-size)

### Fonts

The families referenced by the Viewport variables (Fraunces, Raleway, Albert Sans) are loaded with a Google Fonts `@import url(...)` in `/src/css/_fonts.scss`, which must stay the first `@use` in `main.scss` so the @import lands at the top of the compiled CSS (browsers ignore late @imports). Use the variable-font versions with weight ranges (300..700, plus opsz for Fraunces) — the design system uses in-between weights like 375 and 650 that static weights don't provide. If a new font-family appears in the Figma variables, add it to that @import URL. The preconnect hints for the font hosts stay in `/src/_includes/layouts/base.njk`.

## 06 Define Typography classes and mixins

We will use the values from the Collections/Viewport variables

for each group (and child group) in the Viewport variables, if it contains a 'font-family'
variable we will define the typography mixin and class for it.

An example would be:

From the heading1 group the variables are
font-family
font-size
line-height
font-weight

use the group name as the name of the mixin and class

```
@mixin heading1 {
  font-family: var(--heading1-font-family);
  font-size: var(--heading1-font-size);
  line-height: var(--heading1-line-height);
  font-weight: var(--heading1-font-weight);
  /* any other typography-related classes */
  /* ignore any variables that start with 'figma-' */
}
.heading1 { @include heading1 };

```

some groups are nested/children like form-ui/label-text
concat the parent/children to define the mixin and class
like {parent group}-{child group} like @mixin form-ui-label-text, .form-ui-label-text
