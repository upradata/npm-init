import { exec } from 'child_process';
import fs from 'fs-extra';
import ini from 'ini';
import path from 'path';
import semver from 'semver';
import { promisify } from 'util';
import { bold, red, styles as s, yellow } from '@upradata/node-util';
import { getUserPkgJson } from './get-config';
import prompts from './prompts';
import { InitContext, PkgJson } from './types';


export const getContext = async (): Promise<InitContext> => {

    const dir = process.cwd();
    const packageFile = path.resolve(dir, 'package.json');

    const pkgJson = await fs.pathExists(packageFile).then(async is => is ? (await import(packageFile)).default : {}) as PkgJson;

    const { stdout: npmConfigIni, stderr } = await promisify(exec)('npm config ls -l');

    if (process.env.JEST_WORKER_ID !== undefined ? !!stderr && !npmConfigIni : !!stderr)
        throw new Error(stderr);

    const npmConfig = ini.parse(npmConfigIni);

    const config: InitContext[ 'config' ] = {
        get: k => npmConfig[ k ],
        toJSON: () => npmConfig
    };


    const { yes } = await prompts({
        type: 'confirm',
        name: 'yes',
        message: `Do you want to use the default values?`,
        initial: true
    });


    return { yes, config, dirname: path.basename(dir), basename: dir, filename: packageFile, package: pkgJson };
};


export type PkgJsonGenerated<Data> = { isNew: boolean; data: Data; path: string; };


export const getPkgJson = async (ctx: InitContext): Promise<PkgJsonGenerated<PkgJson>> => {

    const { package: pkgJson, filename: pkgJsonFile } = ctx;

    const isNew = Object.keys(pkgJson).length === 0;

    if (pkgJson.version && !semver.valid(pkgJson.version))
        delete pkgJson.version;

    const config = await getUserPkgJson(ctx);

    Object.keys(config).forEach(k => { pkgJson[ k ] = config[ k ] ?? pkgJson[ k ]; });

    return { isNew, data: removeDuplicateDeps(pkgJson), path: pkgJsonFile };

    /*  // no need for the readme now.
     delete pkgJson.readme;
     delete (pkgJson as any).readmeFilename;

     // really don't want to have this lying around in the file
     delete (pkgJson as any)._id;

     // ditto
     delete (pkgJson as any).gitHead;

     // if the repo is empty, remove it.
     if (!pkgJson.repository)
         delete pkgJson.repository; */

};

type InitMode = 'write' | 'data';

interface InitOptions<M extends InitMode> {
    mode: M;
}

export type InitOpts<M extends InitMode> = Partial<InitOptions<M>>;


export const init = async <M extends InitMode = 'write'>(
    options: InitOpts<M> = {}
): Promise<PkgJsonGenerated<M extends 'write' ? void : PkgJson>> => {

    try {
        const { mode = 'write' } = options;

        const ctx = await getContext();
        const newConfig = await getPkgJson(ctx);

        if (mode === 'write') {
            const pkgJsonString = `${JSON.stringify(newConfig.data, null, 4)}\n`;

            const { isConfirmed } = ctx.yes ? { isConfirmed: true } : await prompts({
                type: 'confirm',
                name: 'isConfirmed',
                message: `About to write to ${newConfig.path}:\n\n${pkgJsonString}\n\nIs this OK?`,
                initial: true
            });


            if (!isConfirmed) {
                console.log(red`Aborted 😅`);
            } else {
                writePkgJson({ ...newConfig, data: pkgJsonString });
            }
        } else {
            return newConfig as any;
        }

    } catch (e) {
        console.error(red`Oups, something went wrong.`);

        if (e.message)
            console.error(e.message);

        if (e.stack)
            console.error(e.stack);
    }
};


export const writePkgJson = async ({ path, data, isNew }: PkgJsonGenerated<string>) => {
    await fs.writeFile(path, data, 'utf8');

    console.log();
    console.log(s.stripIndent.oneLine.stripIndent.green.$`
        😃 "package.json" ${bold`has been generated!`}
        ${isNew ? '' : yellow` (Only the value prompted have been added or modified)`}`
    );

    console.log(s.white.bold.magentaBG.$`\nLet's get work now 💻`);
};


export const removeDuplicateDeps = (pkgJson: PkgJson) => {
    const { optionalDependencies, dependencies } = pkgJson;

    // optionalDependencies don't need to be repeated in two places
    if (dependencies) {

        if (optionalDependencies) {
            for (const name of Object.keys(optionalDependencies))
                delete dependencies[ name ];
        }

        if (Object.keys(dependencies).length === 0)
            delete pkgJson.dependencies;
    }

    return pkgJson;
};
