# Design QA

## Reference

- Source: `https://copypilot.cc/`
- Source desktop screenshots:
  - `.design-reference/copypilot-english-desktop-full.png`
  - `.design-reference/copypilot-desktop-full.png`
- Source mobile screenshots:
  - `.design-reference/copypilot-mobile-english-top.png`
  - `.design-reference/copypilot-mobile-full.png`
- Implementation desktop screenshots:
  - `.design-reference/local-english-desktop-full.png`
  - `.design-reference/local-chinese-desktop-full.png`
- Implementation mobile screenshots:
  - `.design-reference/local-english-mobile-full.png`
  - `.design-reference/local-chinese-mobile-full.png`

## Viewports And States

| Locale  | Viewport    | URL   | State                                     | Result |
| ------- | ----------- | ----- | ----------------------------------------- | ------ |
| English | 1440 x 1000 | `/`   | Default page                              | Passed |
| Chinese | 1440 x 1000 | `/zh` | Empty-input error and second FAQ expanded | Passed |
| English | 390 x 844   | `/`   | Default page                              | Passed |
| Chinese | 390 x 844   | `/zh` | Default page                              | Passed |

## Comparison

### Desktop

- Header, centered navigation, language control, dark grid hero, diagonal lower edge, downloader panel, platform controls, feature grid, three-step section, FAQ, tool groups, and dark footer follow the source layout.
- Chinese content preserves the same hierarchy and stays within all containers.
- At 1440 px, the document width is 1425 px and the viewport width is 1440 px, with no horizontal overflow.

### Mobile

- Header and horizontal mobile navigation remain visible and usable.
- Downloader actions stack vertically; platform controls use a stable two-column grid.
- Feature, step, tool, and footer columns collapse to one column without overlap.
- At 390 px, the document width is 375 px and the viewport width is 390 px, with no horizontal overflow.

## Interactions Tested

- English-to-Chinese language switch: `/` to `/zh`.
- Chinese-to-English language switch: `/zh` to `/`.
- `html lang`, document title, navigation, page copy, result labels, FAQ, and footer update with the active locale.
- Empty input displays the localized validation message.
- FAQ items expand and update `aria-expanded`.
- Desktop and mobile navigation anchors are present.

## Console

- Application console errors: none.
- One unrelated `chrome-extension://` error was emitted by the browser automation extension and is not part of the application.

## Build

- `pnpm cf:build`: passed.
- Existing plugin timing and chunk-size warnings remain non-blocking.

## Optimization Audit - 2026-08-01

### Evidence

| Step | Screenshot                                                                    | Health | Finding                                                                                      |
| ---- | ----------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| 1    | `.design-reference/audit-2026-08-01/01-start-desktop-en-viewport.png`         | Good   | The primary task, supported platforms, and language switch are immediately visible.          |
| 2    | `.design-reference/audit-2026-08-01/03-real-link-failed-desktop-en.png`       | Fixed  | The previous static parser chain returned HTTP 503 for the supplied TikTok link.             |
| 3    | `.design-reference/audit-2026-08-01/04-real-link-success-desktop-en.png`      | Good   | The updated Cobalt chain returns a media URL and presents Download and Copy URL actions.     |
| 4    | `.design-reference/audit-2026-08-01/06-real-link-success-mobile-en-fixed.png` | Good   | Long provider filenames now wrap inside the mobile result heading instead of being clipped.  |
| 5    | `.design-reference/audit-2026-08-01/07-live-zh-mobile-success.png`            | Good   | The deployed Chinese flow parses the real TikTok link and displays localized result actions. |

### Source Comparison

- Current source: `.design-reference/audit-2026-08-01/08-source-copypilot-desktop-current.png`.
- Current deployment: `.design-reference/audit-2026-08-01/09-live-desktop-en.png`.
- The live implementation preserves the source header, dark grid hero, centered input panel, mode buttons, diagonal section transition, spacing rhythm, and compact corner radii while using overseas platform copy.

### Functional Verification

- Test URL: the user-provided public TikTok link for `@aigc1459`.
- Local parse result: `code: 0`, provider `Cobalt`, platform `TikTok`, media URL present.
- Production parse result: `code: 0`, provider `Cobalt`, platform `TikTok`, media URL present.
- Production `/`: HTTP 200.
- Production `/zh`: Chinese `html lang`, title, Open Graph title, and canonical URL verified.
- Production application console errors: none.
- Cloudflare Worker version: `08dca90d-b283-4754-b949-509d99b2da0f`.
- Accessibility evidence: keyboard focus recovery, localized labels, alert semantics, FAQ `aria-expanded`, responsive reflow, and target sizing were checked. This is not a full WCAG conformance audit.

final result: passed
