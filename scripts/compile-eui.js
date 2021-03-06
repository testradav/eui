const { execSync } = require('child_process');
const chalk = require('chalk');
const shell = require('shelljs');
const glob = require('glob');
const path = require('path');

function compileLib() {
  shell.mkdir('-p', 'lib/components/icon/assets/tokens', 'lib/services', 'lib/test');

  console.log('Compiling src/ to es/ and lib/');

  execSync(
    'babel --quiet --out-dir=es --ignore "**/webpack.config.js,**/*.test.js" src',
    { env: { ...this.process.env, BABEL_MODULES: false } }
  );
  execSync('babel --quiet --out-dir=lib --ignore "**/webpack.config.js,**/*.test.js" src');

  console.log(chalk.green('✔ Finished compiling src/'));

  execSync(`node ${path.resolve(__dirname, 'dtsgenerator.js')}`);

  // Also copy over SVGs. Babel has a --copy-files option but that brings over
  // all kinds of things we don't want into the lib folder.
  shell.mkdir('-p', 'lib/components/icon/assets');

  glob('./src/components/**/*.svg', undefined, (error, files) => {
    files.forEach(file => {
      const splitPath = file.split('/');
      const basePath = splitPath.slice(2, splitPath.length).join('/');
      shell.cp('-f', `${file}`, `lib/${basePath}`);
    });

    console.log(chalk.green('✔ Finished copying SVGs'));
  });
}

function compileBundle() {
  shell.mkdir('-p', 'dist');

  console.log('Building bundle...');
  execSync('webpack --config=src/webpack.config.js');

  console.log('Building minified bundle...');
  execSync('NODE_ENV=production webpack --config=src/webpack.config.js');
}

compileLib();
compileBundle();
