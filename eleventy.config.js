import path from "node:path";
import * as sass from "sass";
import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Rewrites absolute URLs in the HTML output (links, hrefs, srcs) by the
  // path prefix when one is set — needed on GitHub Pages, where the site is
  // served from /<repo>/ instead of /. No-op for local dev (prefix "/").
  // CSS url()s aren't rewritten by this plugin, so SCSS uses relative
  // ../images/ paths instead of /images/.
  eleventyConfig.addPlugin(HtmlBasePlugin);
  // Static assets: copied to _site as-is, preserving the path under src/
  // (src/images/x.png -> /images/x.png).
  eleventyConfig.addPassthroughCopy("src/images");
  // Prebuilt CSS (e.g. bootstrap.css) is copied as-is; SCSS compiles
  // separately below, so exclude _*.scss partials and .scss sources here.
  eleventyConfig.addPassthroughCopy("src/css/*.css");
  // Compile SCSS as a first-class template type so the dev server
  // watches it and hot-reloads CSS in the browser without a refresh.
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    useLayouts: false,
    compile: async function (inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      // Partials (_*.scss) are imported by other files, not compiled alone.
      if (parsed.name.startsWith("_")) {
        return;
      }

      const result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || ".", this.config.dir.includes],
      });

      // Re-compile when any imported partial changes.
      this.addDependencies(inputPath, result.loadedUrls);

      return async () => result.css;
    },
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
}
