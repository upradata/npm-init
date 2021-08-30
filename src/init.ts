#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
// import { exec } from 'child_process';
import semver from 'semver';
import prompts from 'prompts';
import { InitContext, PkgJson } from './types';
import conditionalInit from './conditional.init';


const init = async () => {

    const dir = process.cwd();
    const packageFile = path.resolve(dir, 'package.json');

    const { yes } = await prompts({
        type: 'confirm',
        name: 'yes',
        message: `Do you want to use the default values?`,
        initial: false
    });


    const pkgJson = (await fs.pathExists(packageFile) ? require(packageFile) : {}) as PkgJson;

    const d = {};

    const config = {
        get: k => d[ k ],
        toJSON: () => d
    };

    const { dir: dirname, base: basename } = path.parse(packageFile);
    const ctx = { yes, config, dirname, basename, filename: packageFile, package: pkgJson } as InitContext;


    if (!pkgJson.version || !semver.valid(pkgJson.version))
        delete pkgJson.version;


    const promptUser = async () => {
        const result$ = await conditionalInit(ctx);

        const result = await Promise.all(Object.entries(result$).map(async ([ k, v ]) => Promise.all([ k, await v ])));
        return Object.fromEntries(result);
    };

    const data = await promptUser();

    Object.keys(data).forEach(k => { pkgJson[ k ] = data[ k ] ?? pkgJson[ k ]; });



    // no need for the readme now.
    delete pkgJson.readme;
    delete (pkgJson as any).readmeFilename;

    // really don't want to have this lying around in the file
    delete (pkgJson as any)._id;

    // ditto
    delete (pkgJson as any).gitHead;

    // if the repo is empty, remove it.
    if (!pkgJson.repository)
        delete pkgJson.repository;

    updateDeps(pkgJson);

    const jsonString = `${JSON.stringify(updateDeps(pkgJson), null, 4)}\n`;

    const { isConfirmed } = ctx.yes ? { isConfirmed: true } : await prompts({
        type: 'confirm',
        name: 'isConfirmed',
        message: `About to write to ${packageFile}:\n\n${jsonString}\n\nIs this OK?`,
        initial: true
    });


    if (!isConfirmed) {
        console.log('Aborted.');
    } else {
        await fs.writeFile(packageFile, jsonString, 'utf8');
        console.log(`\n"${packageFile}" has been generated! Only the value prompted have been added or modified`);
    }
};


const updateDeps = (deps: Pick<PkgJson, 'dependencies' | 'optionalDependencies'>) => {
    const { optionalDependencies, dependencies } = deps;

    // optionalDependencies don't need to be repeated in two places
    if (dependencies) {

        if (optionalDependencies) {
            for (const name of Object.keys(optionalDependencies))
                delete dependencies[ name ];
        }

        if (Object.keys(dependencies).length === 0)
            delete deps.dependencies;
    }

    return deps;
};


init();
