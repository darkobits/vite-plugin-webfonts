<p align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://github.com/darkobits/vite-plugin-webfonts/assets/441546/2f781ff1-5b1b-450b-819b-968a9552ab7e"
      width="100%"
    >
    <img
      src="https://github.com/darkobits/vite-plugin-webfonts/assets/441546/555dd754-7b1e-416c-9cdf-9a1115833164"
      width="100%"
    >
  </picture>
</p>
<p align="center">
  <a
    href="https://www.npmjs.com/package/@darkobits/vite-plugin-webfonts"
  ><img
    src="https://img.shields.io/npm/v/@darkobits/vite-plugin-webfonts.svg?style=flat-square"
  ></a>
  <a
    href="https://github.com/darkobits/vite-plugin-webfonts/actions?query=workflow%3Aci"
  ><img
    src="https://img.shields.io/github/actions/workflow/status/darkobits/vite-plugin-webfonts/ci.yml?style=flat-square"
  ></a>
  <a
    href="https://depfu.com/repos/github/darkobits/vite-plugin-webfonts"
  ><img
    src="https://img.shields.io/depfu/darkobits/vite-plugin-webfonts?style=flat-square"
  ></a>
  <a
    href="https://conventionalcommits.org"
  ><img
    src="https://img.shields.io/static/v1?label=commits&message=conventional&style=flat-square&color=398AFB"
  ></a>
  <a
    href="https://firstdonoharm.dev"
  ><img
    src="https://img.shields.io/static/v1?label=license&message=hippocratic&style=flat-square&color=753065"
  ></a>
</p>



## Features

* Programmatically generate `@font-face` declarations for your font assets. 💁‍♀️
* Emit CSS files and `<link>` tags or an inline `<style>` tag.

## Install

```
npm install --save-dev vite-plugin-webfonts
```

## Use

This plugin accepts an [`Options`](/src/etc/types.ts#L130) object for
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
        family: 'Comic Sans',
        // Optionally prepend a local() directive to the `src` list for each
        // variant of this font family.
        local: 'Comic Sans MS',
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
the following output:

#### Development

> `index.html` (excerpt)

```html
<html>
  <head>
    <style>
      @font-face {
        font-family: 'Comic Sans';
        font-weight: 200;
        src: local('Comic Sans MS'),
             url(/assets/comic-sans-light.woff) format('woff'),
             url(/assets/comic-sans-light.woff2) format('woff2')
      }

      @font-face {
        font-family: 'Comic Sans';
        font-weight: 400;
        src: local('Comic Sans MS'),
             url(/assets/comic-sans-regular.woff) format('woff'),
             url(/assets/comic-sans-regular.woff2) format('woff2')
      }
    </style>
  </head>
</html>
```

#### Production

> `index.html` (excerpt)

```html
<html>
  <head>
    <link rel="stylesheet" href="fonts.css" />
  </head>
</html>
```

> `fonts.css`

```css
@font-face {
  font-family: 'Comic Sans';
  font-weight: 200;
  src: local('Comic Sans MS'),
       url(/assets/comic-sans-light.woff) format('woff'),
       url(/assets/comic-sans-light.woff2) format('woff2')
}

@font-face {
  font-family: 'Comic Sans';
  font-weight: 400;
  src: local('Comic Sans MS'),
       url(/assets/comic-sans-regular.woff) format('woff'),
       url(/assets/comic-sans-regular.woff2) format('woff2')
}
```

> **Note:** Final asset names may vary according to your Vite configuration.

## Advanced

If a large number of font files need to be loaded, this plugin includes a helper
that allows you to generate font variants from a set of glob patterns.

For this example, let's assume we have the following files in our `config.root`
directory:

```
assets/comic-sans.200.woff
assets/comic-sans.400.woff
```

Here, we have encoded the attributes we want to use in the font variant directly
into the file name. We can then use this information to programmatically
generate a variant descriptor for each file:

> `vite.config.js`

```js
import path from 'path';
import { defineConfig } from 'vite';
import webfontsPlugin from 'vite-plugin-webfonts';

export default defineConfig(() => ({
  plugins: [
    // Instead of passing an object to the plugin, pass a function that returns
    // a configuration object. This function will be invoked with a context
    // object that contains the `familyFromFiles` helper.
    webfontsPlugin(({ familyFromFiles }) => ({
      fonts: [
        familyFromFiles({
          family: 'Comic Sans',
          // `include` may be a string or array of strings to pass to `globby`.
          include: 'assets/comic-sans-*',
          // Each matched font file is then passed to a `variants` function,
          // which is responsible for returning a `FontVariant` object.
          variants: fontFile => {
            // This logic will vary based on the naming scheme used. In our
            // case, we have used a dot-delimited pattern that includes the
            // font's weight and format (extension). We do not use the first
            // segment of the file name.
            const [, weight, format] = path.basename(fontFile).split('.');

            // We can then simply return this information directly.
            return { weight, format };
          }
        })
      ]
    }))
  ]
}));
```

With the above setup, we don't need to update our Vite configuration when we add
new font assets as long as we use a consistent naming scheme for our files.

## See Also

If you use fonts from [Google Fonts](https://fonts.google.com) or [TypeKit](https://typekit.com),
check out [`vite-plugin-fonts`](https://github.com/stafyniaksacha/vite-plugin-fonts).

<br />
<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/189774318-67cf3578-f4b4-4dcc-ab5a-c8210fbb6838.png" style="max-width: 100%;">
</a>
