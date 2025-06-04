const { transformSync } = require('esbuild');

module.exports = {
  process(src, filename) {
    const loader = filename.endsWith('.tsx')
      ? 'tsx'
      : filename.endsWith('.ts')
      ? 'ts'
      : 'js';
    const { code } = transformSync(src, {
      loader,
      format: 'cjs',
      sourcemap: 'inline',
    });
    return { code };
  },
};
