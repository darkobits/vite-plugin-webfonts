import path from 'path';

import { paramCase } from 'change-case';
import fs from 'fs-extra';

import log from 'lib/log';
import { buildFontFaceDeclarations, ensureIsArray } from 'lib/utils';

import type { PluginOptions, FontFamily } from 'etc/types';
import type { Plugin, ResolvedConfig } from 'vite';


export default function VitePluginWebfonts(userOpts: PluginOptions): Plugin {
  /**
   * @private
   *
   * Plugin configuration with defaults.
   */
  const opts = {
    emitCss: true,
    verbose: false,
    ...userOpts
  };


  /**
   * @private
   *
   * The user's Vite configuration.
   */
  let config: ResolvedConfig;


  /**
   * @private
   *
   * Reference to configured fonts. Will be updated throughout the build
   * process.
   */
  let fonts: Array<FontFamily> = opts.fonts;


  /**
   * @private
   *
   * Output file name of the CSS file emitted, if applicable.
   */
  let cssFileName: string;


  /**
   * Plugin definition.
   */
  const plugin: Plugin = { name: 'vite-plugin-fonts' };


  /**
   * Captures Vite configuration when it becomes available.
   */
  plugin.configResolved = resolvedConfig => {
    config = resolvedConfig;
  };


  /**
   * Updates font sources by resolving asset reference IDs to their output file
   * names.
   *
   * Only runs when mode is `production`; `emitFile` is not available in
   * development.
   */
  plugin.generateBundle = function() {
    if (!config) throw new Error('[vite-plugin-fonts] Configuration not resolved.');
    if (!config.isProduction) return;

    fonts = fonts.map<FontFamily>(fontFamily => {
      const fontsForFamily = {
        ...fontFamily,
        variants: fontFamily.variants.map(fontFace => ({
          ...fontFace,
          src: ensureIsArray(fontFace.src).map(fontPath => {
            const resolvedPath = path.resolve(config.root, fontPath);
            const name = path.basename(resolvedPath);
            const source = fs.readFileSync(resolvedPath);
            const referenceId = this.emitFile({ type: 'asset', name, source });
            const outputFilePath = this.getFileName(referenceId);

            if (opts.verbose) log.info(log.prefix(fontFamily.family), `Emitted ${log.chalk.green(outputFilePath)}`);

            return outputFilePath;
          })
        }))
      };

      if (opts.emitCss) {
        const name = `${paramCase(fontFamily.family.toLowerCase())}.css`;
        const source = buildFontFaceDeclarations([fontsForFamily], opts, config);

        cssFileName = this.getFileName(this.emitFile({
          type: 'asset',
          name,
          source
        }));

        if (opts.verbose) log.info(`Emitted ${log.chalk.green(cssFileName)}`);
      }

      return fontsForFamily;
    });

    // if (opts.emitCss) {
    //   const source = buildFontFaceDeclarations(fonts, opts);
    //   cssFileName = this.getFileName(this.emitFile({
    //     type: 'asset',
    //     name: 'fonts.css',
    //     source
    //   }));
    //   if (opts.verbose) log.info(`Emitted ${log.chalk.green(cssFileName)}`);
    // }
  };


  /**
   * Creates a @font-face declaration for each font asset and injects a <style>
   * tag into <head>.
   *
   * N.B. In development, since the `buildStart` and `generateBundle` phases do
   * not run, url() values will be unaltered.
   */
  plugin.transformIndexHtml = () => {
    if (!config) throw new Error('[vite-plugin-fonts] Configuration not resolved.');
    if (fonts.length === 0) return;

    if (opts.emitCss && config.isProduction && cssFileName) {
      if (opts.verbose) log.info('Added <link> to index.html.');

      return [{
        tag: 'link',
        attrs: {
          id: opts.verbose ? 'vite-plugin-fonts' : undefined,
          rel: 'stylesheet',
          href: cssFileName
        }
      }];
    }

    const children = buildFontFaceDeclarations(fonts, opts, config);

    if (opts.verbose) log.info('Added <style> tag to index.html.');

    return [{
      tag: 'style',
      attrs: {
        id: opts.verbose ? 'vite-plugin-fonts' : undefined,
        type: 'text/css'
      },
      children: `\n${children}\n`
    }];
  };


  return plugin;
}
