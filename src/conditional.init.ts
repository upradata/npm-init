import prompts from 'prompts';
import { InitContext, PkgJson } from './types';

export default async (ctx: InitContext): Promise<PkgJson> => {

    const { type } = await prompts({
        type: 'select',
        name: 'type',
        message: 'init type',
        choices: [
            { title: 'default', value: 'npm default' },
            { title: 'upradata', value: 'upradata' },
        ],
        initial: 0
    });

    if (!type)
        return {};

    switch (type) {
        case 'npm default': return import('./default.init').then(m => m.default(ctx));
        case 'upradata': return import('./upradata.init').then(async m => m.default(ctx));
        default: throw new Error(`Init type not defined`);
    }
};
