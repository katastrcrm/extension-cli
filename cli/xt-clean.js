#!/usr/bin/env node

/**
 * @name xt-clean
 * @module
 * @public
 *
 * @description Clean operation iterates over files and directories listed in the
 * project .gitignore file, and removes all ignored files and
 * directories, except node_modules, .idea/, and .vscode.
 *
 * To remove these directories, you must explicitly pass a flag to delete
 * each one of them.
 */

const fs = require('fs');
const del = require('del');
const path = require('path');
const chalk = require('chalk');
const program = require('commander');
const readline = require('readline');
const pkg = require('../package.json');
const ignore = path.join(process.cwd(), '.gitignore');

let counter = 0;

program
    .version(pkg.version)
    .option('-m --modules', 'Clean node_modules')
    .option('-i --idea', 'Clean .idea/ directory')
    .option('-v --vscode', 'Clean .vscode/ directory')
    .parse(process.argv);

readline.createInterface({input: fs.createReadStream(ignore)})
    .on('line', line => {
        if ((line.indexOf('.idea/') > -1 && !program.idea) ||
            (line.indexOf('node_modules/') > -1 && !program.modules)) {
            return false;
        }
        let basePath = path.join(process.cwd(), line);
        if (fs.existsSync(basePath)) {
            try {
                if (fs.lstatSync(basePath).isDirectory()) {
                    del.sync(path.join(basePath, '/*'));
                }
                if (fs.existsSync(basePath)) {
                    del.sync(basePath);
                }
                console.log(`- ${line}`);
                counter++;
            } catch (e) {
                console.log(chalk.bold.red(e), line);
            }
        }
    })
    .on('close', () => {
        console.log(chalk.bold[counter === 0 ?
            'yellow' : 'green'](`Done. Cleaned: ${counter}`));
        process.exit(0);
    });