import { paramCase } from 'change-case';
import globby from 'globby';

import log from 'lib/log';

import type {
  FontFamily,
  FontVariant,
  FamilyFromFilesOptions,
  PluginOptions
} from 'etc/types';
import type { ResolvedConfig } from 'vite';


/**
 * @private
 *
 * Provided a file path, returns the format() hint associated with the file's
 * extension or `undefined` for unknown extensions.
 */
function inferFormat(filePath: string) {
  const formats: Record<string, string> = {
    woff: 'woff',
    woff2: 'woff2',
    ttf: 'truetype',
    otf: 'opentype',
    eot: 'embedded-opentype',
    svg: 'svg',
    svgz: 'svg'
  };

  const extension = filePath.split('.').pop();
  return extension ? formats[extension] : undefined;
}


/**
 * @private
 *
 * If the provided string contains whitespace characters, wraps the string in
 * double quotes and returns it. Otherwise, returns the string as-is.
 */
function quoteMultiWord(str: string) {
  return /\s/g.test(str) ? `"${str}"` : str;
}


/**
 * @private
 *
 * Transforms an object of CSS rule/value pairs into an array of strings in the
 * format `<rule>: <value>;`. Also transforms keys from camel-case to kebab-case
 * and prefixes @font-face rules with `font-` as-needed.
 */
function transformRules(attributes?: Record<string, any>) {
  const requiresPrefix = new Set([
    'weight',
    'display',
    'stretch',
    'style',
    'variant',
    'variationSettings',
    'featureSettings'
  ]);

  return attributes
    ? Object.entries(attributes).map(([attr, value]) => {
      const prefixedAttr = requiresPrefix.has(attr)
        ? `font-${paramCase(attr)}`
        : paramCase(attr);

      return `  ${prefixedAttr}: ${value};`;
    })
    : [];
}


/**
 * If the provided value is an array, it is returned as-is. Otherwise, the value
 * is wrapped in an array and returned.
 */
export function ensureIsArray<T = any>(value: T) {
  return (Array.isArray(value) ? value : [value]) as T extends Array<any> ? T : Array<T>;
}


/**
 * Provided an array of FontFamily objects, returns a CSS string of
 * @font-face declarations.
 */
export function buildFontFaceDeclarations(fonts: Array<FontFamily>, opts: PluginOptions, config: ResolvedConfig) {
  return fonts.flatMap(fontFamily => {
    // Ensure font names with spaces are quoted.
    const family = quoteMultiWord(fontFamily.family);

    const localValues = ensureIsArray(fontFamily.local).map(localFont => localFont && `local("${localFont}")`).filter(Boolean);

    // Map each font face in the family into a @font-face declaration.
    const fontFaceDeclarations = fontFamily.variants.map(fontVariant => {
      const { src, format, ...attributes } = fontVariant;

      // Map each source into a valid url() value with optional format()
      // hint.
      const urlValues = ensureIsArray(src).map(fileName => {
        const finalFormat = format ?? inferFormat(fileName);
        const urlValue = finalFormat
          ? `url(${config.base}${fileName}) format("${finalFormat}")`
          : `url(${config.base}${fileName})`;

        return urlValue;
      });

      const srcValue = [...localValues, ...urlValues].join(', ');

      return [
        '@font-face {',
        `  font-family: ${family};`,
        ...transformRules(attributes),
        `  src: ${srcValue};`,
        '}'
      ].filter(Boolean).join('\n');
    });

    if (opts?.verbose) {
      const numDeclarations = fontFaceDeclarations.length;
      log.info(log.prefix(fontFamily.family), `Generated ${log.chalk.yellow(numDeclarations)} @font-face declarations.`);
    }

    return fontFaceDeclarations;
  }).join('\n\n');
}


/**
 * Provided a Vite configuration object, returns a function that generates a
 * `FontFamily` object from a set of matched files.
 */
export function familyFromFilesFactory(config: ResolvedConfig) {
  return (opts: FamilyFromFilesOptions) => {
    const matchedFiles = globby.sync(opts.include, {
      cwd: config.root || ''
    });

    const variants = matchedFiles.map(matchedFile => {
      const variant = opts.variants(matchedFile);

      return {
        ...variant,
        src: matchedFile
      } as FontVariant;
    });

    const family = {
      family: opts.family,
      local: opts.local,
      variants
    } as FontFamily;

    return family;
  };
}
