# generateStaticFigmaFile

_Internal utility script (not published)_

A helper tool to download a Figma Frame as an API response JSON file and a rendered SVG image file.

## Usage

```sh
$ yarn generate-static-figma-file -t <Figma Personall Access Token> -u <Figma file URL> -o <Output directory>

# You can also invoke by below
$ yarn workspace @figspec/generate-static-figma-file generate <...args>

# or this
$ cd scripts/generateStaticFigmaFile
$ yarn generate <...args>
```

This script loads `.env` file at the root of the repository with `dotenv` package.
If the `--token` option is absent, the script will use environment variable `FIGMA_TOKEN` instead.

```
# <repo root>/.env
FIGMA_TOKEN=<Figma Personal Access Token>
```

```sh
$ yarn generate-static-figma-file <...args except --token>
```

For more information, please refer tool's help.

```sh
$ yarn generate-static-figma-file --help
```
