/**
 * Describes a single variant of a font within a family.
 */
export interface FontVariant {
  /**
   * Path to the source file (or array of paths) for a font variant.
   */
  src: string | Array<string>;

  /**
   * Optionally provide an explicit `format()` hint to be used in the `src`
   * attribute for this variant.
   */
  format?: string;

  /**
   * `font-weight` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-weight
   */
  weight?: string | number;

  /**
   * `font-display` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
   */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

  /**
   * `font-stretch` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-stretch
   */
  stretch?: string;

  /**
   * `font-style` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-style
   */
  style?: string;

  /**
   * `font-variant` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-variant
   */
  variant?: string;

  /**
   * `font-variation-settings` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-variation-settings
   */
  variationSettings?: string;

  /**
   * `font-feature-settings` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-feature-settings
   */
  featureSettings?: string;

  /**
   * `ascent-override` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/ascent-override
   */
  ascentOverride?: string;

  /**
   * `descent-override` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/descent-override
   */
  descentOverride?: string;

  /**
   * `line-gap-override` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/line-gap-override
   */
  lineGapOverride?: string;

  /**
   * `unicode-range` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range
   */
  unicodeRange?: string;

  /**
   * `size-adjust` for this variant.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust
   */
  sizeAdjust?: string;
}


/**
 * Describes a font family.
 */
export interface FontFamily {
  /**
   * `font-family` name.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-family
   */
  family: string;

  /**
   * Optional `local()` directive to use in `src` attributes for this family.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face#description
   */
  local?: string | Array<string>;

  /**
   * Array of individual variants to load for this family.
   */
  variants: Array<FontVariant>;
}


export interface FamilyFromFilesOptions {
  family: FontFamily['family'];
  local?: FontFamily['local'];

  /**
   * Pattern or array of patterns that should be included in this font family.
   * Paths are assumed to be relative to `config.root`.
   */
  include: string | Array<string>;

  /**
   * Function that will be passed a single matched path and should return a
   * partial `FontVariant` object.
   *
   * Note: The matched path will be used as the `src` property for the
   * FontVariant, so it is not required.
   */
  variants: (path: string) => Omit<FontVariant, 'src'>;
}


/**
 * Configuration object accepted by vite-plugin-fonts.
 */
export interface PluginOptions {
  /**
   * Array of font families to process.
   */
  fonts: Array<FontFamily>;

  /**
   * If `true`, a CSS file will be emitted and linked-to in index.html when
   * building for production.
   *
   * If `false` or if in development mode, a <style> tag will be added to
   * index.html.
   *
   * @default `true`
   */
  emitCss?: boolean;

  /**
   * If `true`, outputs additional logging.
   *
   * @default `false`
   */
  verbose?: boolean;
}


/**
 * Object passed to configuration functions.
 */
export interface PluginOptionsContext {
  familyFromFiles: (opts: FamilyFromFilesOptions) => FontFamily;
}


/**
 * Signature of configuration functions.
 */
export type PluginOptionsFactory = (context: PluginOptionsContext) => PluginOptions;
