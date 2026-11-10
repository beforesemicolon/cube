---
name: '{{t.cube.title}}'
title: '{{t.cube.title}}'
description: '{{t.cubeLanding.description}}'
path: /
order: 0
layout: landing
---

::: layout landing-hero title="{{t.cubeLanding.heroTitle}}" title2="{{t.cubeLanding.heroAccent}}"

=== copy

{{t.cubeLanding.description}}

=== stat componentCount

{{t.cubeLanding.components}}

=== stat

## HTML

{{t.cubeLanding.customElements}}

=== stat

## CSS

{{t.cubeLanding.themeTokens}}

=== code filename=editor.html lang=html

```html
<cb-theme-provider appearance="system">
  <cb-toolbar accessible-label="Editor actions">
    <cb-button label="Preview"></cb-button>
    <cb-button
      label="Publish"
      variant="primary"
    ></cb-button>
  </cb-toolbar>
</cb-theme-provider>
```

:::

::: layout landing-ecosystem

=== header

{{t.cubeLanding.ecosystem}}

## {{t.cubeLanding.ecosystemTitle}}

{{t.cubeLanding.ecosystemCopy}}

=== product title="Markup" package="@beforesemicolon/markup" color=orange icon=reactive href="https://markup.beforesemicolon.com/"

{{t.cubeLanding.markupCopy}}

=== product title="Web Component" package="@beforesemicolon/web-component" color=cyan icon=webComponents href="https://web-component.beforesemicolon.com/"

{{t.cubeLanding.webComponentCopy}}

:::

::: layout landing-features

=== header

{{t.cubeLanding.whyCube}}

## {{t.cubeLanding.featuresTitle}}

{{t.cubeLanding.featuresCopy}}

=== feature icon=reactive

### {{t.cubeLanding.themeTitle}}

{{t.cubeLanding.themeCopy}}

=== feature icon=tiny

### {{t.cubeLanding.libraryTitle}}

{{t.cubeLanding.libraryCopy}}

=== feature icon=standards

### {{t.cubeLanding.everywhereTitle}}

{{t.cubeLanding.everywhereCopy}}

=== feature icon=plug

### {{t.cubeLanding.setupTitle}}

{{t.cubeLanding.setupCopy}}

=== feature icon=webComponents

### {{t.cubeLanding.customizationTitle}}

{{t.cubeLanding.customizationCopy}}

=== feature icon=surgical

### {{t.cubeLanding.appTitle}}

{{t.cubeLanding.appCopy}}

:::

::: layout landing-showcase

=== header

{{t.cubeLanding.seeItInAction}}

## {{t.cubeLanding.codeTitle}}

{{t.cubeLanding.codeCopy}}

=== example label="{{t.cubeLanding.workspace}}" color=primary filename=workspace.html lang=html

```html
<cb-workspace>
    <cb-toolbar slot="header" accessible-label="Project actions">
        <cb-button label="Save" variant="primary"></cb-button>
    </cb-toolbar>
    <cb-viewport accessible-label="Design canvas">
        <cb-artboard name="Home page"></cb-artboard>
    </cb-viewport>
</cb-workspace>
```

=== example label="{{t.cubeLanding.forms}}" color=accent filename=verification.html lang=html

```html
<form>
    <cb-field label="Verification code">
        <cb-verification-code
            name="code"
            length="6"
            accessible-label="Verification code"
            required
        ></cb-verification-code>
    </cb-field>
    <cb-button label="Verify" type="submit" variant="primary"></cb-button>
</form>
```

=== example label="{{t.cubeLanding.emptyState}}" color=primary filename=empty-state.html lang=html

```html
<cb-empty-state icon="plus" heading="Create your first page">
    <p>Start from scratch or choose a template.</p>
    <cb-button variant="primary">Create page</cb-button>
</cb-empty-state>
```

=== example label="{{t.cubeLanding.videoPlayer}}" color=accent filename=video.html lang=html

```html
<cb-video-player
    src="/media/editor-tour.mp4"
    poster="/media/editor-tour.jpg"
    media-title="Editor tour"
    preload="metadata"
    play-label="Play"
    pause-label="Pause"
></cb-video-player>
```

=== example label="{{t.cubeLanding.chart}}" color=primary filename=chart.js lang=javascript

```javascript
import '@beforesemicolon/cube'

const chart = document.createElement('cb-cartesian-chart')
chart.accessibleLabel = 'Weekly visits'
chart.xAxis = { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }
chart.series = [
    { id: 'visits', name: 'Visits', type: 'line', data: [12, 20, 17, 24, 31] },
]
document.body.append(chart)
```

:::

::: layout landing-install

=== header

{{t.cubeLanding.quickStart}}

## {{t.cubeLanding.installTitle}}

{{t.cubeLanding.installCopy}}

=== tab key=npm label=npm command="npm install @beforesemicolon/cube"

=== tab key=yarn label=yarn command="yarn add @beforesemicolon/cube"

=== tab key=pnpm label=pnpm command="pnpm add @beforesemicolon/cube"

:::

::: layout landing-cta title="{{t.cubeLanding.ctaTitle}}" title2="Cube"

=== copy

{{t.cubeLanding.ctaCopy}}

:::
