import path from "node:path";
import * as sass from "sass";

export default function (eleventyConfig) {
  // Static assets: copied to _site as-is, preserving the path under src/
  // (src/images/x.png -> /images/x.png).
  eleventyConfig.addPassthroughCopy("src/images");
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
