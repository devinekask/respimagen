# Responsive Images Generator

This is a Node.js script and library that generates responsive images for your website. It uses the [sharp](https://sharp.pixelplumbing.com/) image processing library.

Feel free to use it and modify it to your needs.

## Installation

Use it via npx:

```bash
npx respimagen
```

or install it globally using npm:

```bash
npm install -g respimagen
```

### Show help

```bash
respimagen --help
```

## Usage

```bash
respimagen <input> -s [sizes] -t [filetypes] -o [outputdir] -c [clear]
```

### Options

``` bash
Positional Arguments:
  input            file or directory to process                       [required]

Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
  -s, --sizes      different sizes to generate, separated by comma. If omitted,
                   keeps original size                               [optional]
  -t, --filetypes  different filetypes to generate, separated by comma
                   Supported: avif, webp, jpeg, jpg, png
                                                             [default: "avif"]
  -o, --outputdir  output directory                           [default: "output"]
  -c               clear the output directory before processing, default false
                                                      [boolean] [default: false]

```

## Examples

Resize and convert beach.jpg to 500px and 750px in webp and avif format.

```bash
  respimagen beach.jpg -s 500,750 -t webp,avif
```

Convert all images to avif, keeping original dimensions

```bash
  respimagen  ./photos
```

 Process all images with multiple sizes (avif format)

```bash
  respimagen ./photos -s 300,500,700
```

Process all images with multiple sizes and formats, clearing output first

```bash
  respimagen ./photos -s 300,500,700 -t webp,avif -o output -c
```

## Programmatic Usage

You can also import and use the core functionality in your own Node.js projects:

```javascript
import { processPath } from './lib/processor.js';

// Process a single image
const result = await processPath('photo.jpg', {
  sizes: [400, 800, 1200],
  filetypes: 'webp,avif',
  outputdir: 'dist',
  clear: true
});

console.log(result.output); // Array of processed files
console.log(result.srcset); // Srcset string for responsive images

// Process a directory
const dirResult = await processPath('./images', {
  sizes: [300, 500, 700],
  filetypes: 'avif,jpeg',
  outputdir: 'output'
});
```

## Testing

Run the test suite with:

```bash
npm test
```

## Dependencies

- **sharp** (^0.34.4): Image processing
- **yargs** (^18.0.0): CLI argument parsing
