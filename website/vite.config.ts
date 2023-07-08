import { glob } from "glob";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  // In Vite you need to explicitly enumerate every HTML files.
  // Otherwise it won't be built, although it works on dev server.
  const htmlFiles = await glob("**/*.html", {
    ignore: ["dist/**"],
    // @ts-ignore: ESM-Node.js thing
    cwd: __dirname,
    withFileTypes: true,
  });

  return {
    // Use relative paths for output files. At least this docs site does not
    // rely on absolute paths so there is no advantage for absolute paths,
    // which Vite defaults to.
    base: "",
    build: {
      rollupOptions: {
        input: Object.fromEntries(
          htmlFiles.map((path, i) => [i, path.fullpath()])
        ),
        output: {
          // With [name] in it, Vite (or Rollup idk) uses a file name of the first HTML file
          // access the asset. For example, examples/style.css became dist/parameter-missing-error-[hash].css
          // in my testing and dist/examples/file.html imports dist/parameter-missing-error-[hash].css.
          // This is not directly visible to users but confusing enough for whom examined raw HTML for
          // markup usage.
          assetFileNames: "[hash:12][extname]",
        },
      },
    },
  };
});
