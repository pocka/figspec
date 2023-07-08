import "../../src";

// This is obviously no-op but required: without these kind of side-effect-able
// statement, Vite (or Rollup, or code minifier library, or something idk)
// screws module deduplication or something then emits completely broken
// JS for **other example pages**.
// It inserts `import "/assets/<non-existent-filename>.js"` to every other
// JS files except this and top-level one. (e.g. `examples/file.ts`)
// I haven't dug because I know from my experience Vite's MPA support is
// totally incomplete afterthought marketing bs. So much bugs, pitfalls,
// DX problems and design problems. Maybe their tooling stack is complicated
// or fragile but the final quality of the tool is for overall experience.
// As a user of the tool, I gave up. Hence, this ugly workaround.
document.getElementById("demo");
