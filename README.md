<img src="https://user-images.githubusercontent.com/441546/147814145-f3f13973-83f1-410b-99ec-468cb554fc01.png" style="max-width: 100%" />
<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-webfonts"><img src="https://img.shields.io/npm/v/vite-plugin-webfonts.svg?style=flat-square&color=398AFB"></a>
  <a href="https://github.com/darkobits/vite-plugin-webfonts/actions?query=workflow%3Aci"><img src="https://img.shields.io/github/workflow/status/darkobits/vite-plugin-webfonts/ci/master?style=flat-square"></a>
  <a href="https://depfu.com/github/darkobits/vite-plugin-webfonts"><img src="https://img.shields.io/depfu/darkobits/vite-plugin-webfonts?style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/static/v1?label=commits&message=conventional&style=flat-square&color=398AFB"></a>
</p>

<br />

Generate `@font-face` declarations for your font assets. 💁‍♀️

## Features

* Programmatically generate `@font-face` declarations for font assets.
* Emit CSS files and `<link>` tags or an inline `<style>` tag.

## Install

```
npm install --save-dev vite-plugin-webfonts
```

## Use

This plugin accepts an [`Options`](/src/etc/types.ts#L117) object for
configuration:

> `vite.config.js`

```js
import { defineConfig } from 'vite';
import webfontsPlugin from 'vite-plugin-webfonts';

export default defineConfig(() => ({
  plugins: [
    webfontsPlugin({
      fonts: [{
        // The `font-family` value used for each variant.
        family: 'Comic Sans MS',
        // Variants may specify any CSS rule that is valid in a @font-face
        // block. For idiomatic JavaScript, camel case keys will be converted to
        // kebab case and `font-` will be prefixed to rules as-needed. For
        // example, `featureSettings` will become `font-feature-settings` in
        // emitted CSS.
        variants: [{
          weight: 200,
          // Sources should be relative to config.root (typically where
          // index.html is). `src` may be a single string or an array of
          // strings. format() hints are inferred based on a file's extension.
          src: [
            'assets/comic-sans-light.woff',
            'assets/comic-sans-light.woff2'
          ]
        }, {
          weight: 400,
          src: [
            'assets/comic-sans-regular.woff'
            'assets/comic-sans-regular.woff2'
          ]
        }]
      }],
      // Optional. Outputs additional logging.
      verbose: true,
      // Optional. If false, the plugin will only inject a <style> tag rather
      // than CSS files.
      emitCss: false,
    })
  ]
}));
```

Assuming `emitCss` is enabled (default), the above configuration will produce
the following output.

### Development

> `index.html` (excerpt)

```html
<html>
  <head>
    <style>
      @font-face {
        font-family: 'Comic Sans MS';
        font-weight: 200;
        src: url(/assets/comic-sans-light.woff) format('woff'),
          url(/assets/comic-sans-light.woff2) format('woff2')
      }

      @font-face {
        font-family: 'Comic Sans MS';
        font-weight: 400;
        src: url(/assets/comic-sans-regular.woff) format('woff'),
          url(/assets/comic-sans-regular.woff2) format('woff2')
      }
    </style>
  </head>
</html>
```

### Production

> `index.html` (excerpt)

```html
<html>
  <head>
    <link rel="stylesheet" href="comic-sans-ms.css¹" />
  </head>
</html>
```

> `comic-sans-ms.css`¹

```css
@font-face {
  font-family: 'Comic Sans MS';
  font-weight: 200;
  src: url(/assets/comic-sans-light.woff¹) format('woff'),
    url(/assets/comic-sans-light.woff2¹) format('woff2')
}

@font-face {
  font-family: 'Comic Sans MS';
  font-weight: 400;
  src: url(/assets/comic-sans-regular.woff¹) format('woff'),
    url(/assets/comic-sans-regular.woff2¹) format('woff2')
}
```

¹Final asset names may vary according to your Vite configuration.

## See Also

If you use fonts from [Google Fonts](https://fonts.google.com) or [TypeKit](https://typekit.com),
check out [`vite-plugin-fonts`](https://github.com/stafyniaksacha/vite-plugin-fonts).

<br />
<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/102322726-5e6d4200-3f34-11eb-89f2-c31624ab7488.png" style="max-width: 100%;">
</a>
