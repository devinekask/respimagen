# Responsive Images Generator

This is a nodejs script that generates responsive images for your website. It uses the [sharp](https://sharp.pixelplumbing.com/) image processing library.

Feel free to use it and modify it to your needs.

```bash
Usage:  -i <input> -s [sizes] -t [filetypes] -o [outputdir] -c [clear]

Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
  -i, --input      file or directory to process                       [required]
  -s, --sizes      different sizes to generate, separated by comma. Add a '-' to
                    skip this
  -t, --filetypes  different filetypes to generate, separated by comma
  -c               clear the output directory before processing, default false
                                                      [boolean] [default: false]

Examples:
   -i beach.jpg -s 500,750 -t webp,avif  Resize and convert beach.jpg to 500px a
                                         nd 750px in webp and avif format
```
