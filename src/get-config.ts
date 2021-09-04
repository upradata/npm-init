import prompts from 'prompts';
import path from 'path';
import { findUp } from '@upradata/node-util';
import { InitContext, PkgJson } from './types';

type NpxInit = Record<string, { title: string; file: string; }>;

export const getUserPkgJson = async (ctx: InitContext): Promise<PkgJson> => {
    const configFiles = [ 'js', 'json' ].flatMap(ext => [ `npx-init.${ext}`, `.npx-init.${ext}` ]);

    const npxConfigPath = false ||
        await findUp(configFiles, { type: 'file', from: process.cwd() }) ||
        await findUp('npx-init.json', { type: 'file', from: __dirname });


    const npxInit: NpxInit = (await import(npxConfigPath)).default;

    const { key } = await prompts({
        type: 'select',
        name: 'key',
        message: 'init type',
        choices: Object.entries(npxInit).map(([ k, v ]) => ({ title: v.title, value: k })).sort((v1, v2) => v1.title.localeCompare(v2.title)),
        initial: 0
    });

    // user can press Ctrl-C or something similar
    if (!key)
        return {};

    const filePath = path.resolve(process.cwd(), npxInit[ key ].file);

    return import(filePath).then(m => {
        if (typeof m.default === 'function')
            return m.default(ctx);

        return m.default;
    });

    /* switch (type) {
        case 'npm default': return import('./default.init').then(m => m.default(ctx));
        case 'upradata': return import('./upradata.init').then(m => m.default(ctx));
        default: throw new Error(`Init type not defined`);
    } */
};
