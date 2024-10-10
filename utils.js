const srcsetGenerator = (files) => {
  // group files by extension
  const groupedFiles = files.reduce((acc, file) => {
    const ext = file.ext;
    if (!acc[ext]) {
      acc[ext] = [];
    }
    acc[ext].push(file);
    return acc;
  }, {});

  // generate srcset for each extension
  const srcsets = Object.entries(groupedFiles).map(
    ([ext, files]) =>
      `srcset="${files
        .map((file) => `${file.file} ${file.size}w`)
        .join(",\n")}"`
  );

  return srcsets.join("\n\n");
};

export { srcsetGenerator };
