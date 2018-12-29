/**
 * Created by chenlizan on 2017/12/25.
 */

// import webpack from 'webpack';
// import { join } from 'path';
//
// import pullAll from 'lodash.pullall';
// import uniq from 'lodash.uniq';

const fs = require('fs');
const {join} = require('path');

const dd = function () {
  // const appBuild = paths.dllNodeModule;
    const appDirectory = fs.realpathSync(process.cwd());
  const pkg = require(join(appDirectory, 'package.json')); // eslint-disable-line



  // const { include, exclude } = rcConfig.dllPlugin || {};
  //
  const dependencyNames = Object.keys(pkg.dependencies);

    console.log(pkg);
  // const includeDependencies = uniq(dependencyNames.concat(include || []));
  //
  // return {
  //   entry: {
  //     roadhog: pullAll(includeDependencies, exclude),
  //   },
  //   output: {
  //     path: appBuild,
  //     filename: '[name].dll.js',
  //     library: '[name]',
  //   },
  //   plugins: [
  //     new webpack.DllPlugin({
  //       path: join(appBuild, '[name].json'),
  //       name: '[name]',
  //       context: paths.appSrc,
  //     }),
  //   ],
  //   resolve: {
  //     modules: [
  //       paths.appDirectory,
  //       'node_modules',
  //       paths.ownNodeModules,
  //     ],
  //   },
  // };
}

dd();
