import fs from 'fs-extra';
import path from 'path';
import validateLicense from 'validate-npm-package-license';
import npa from 'npm-package-arg';
import semver from 'semver';
import { flattenPerson, niceName, pkgPrompts, unflattenPerson, validatePackageName } from '../util';
import { InitContext, PkgJson, PkgJsonKeys } from '../types';
import prompts from '../prompts';
import { JSONSchemaForNPMPackageJsonFiles } from '../pkg-json';


const isTestPkg = (p: string) => {
    return !!p.match(/^(expresso|mocha|tap|coffee-script|coco|streamline)$/);
};


export default async (ctx: InitContext): Promise<PkgJson> => {

    const packageProp = <P extends PkgJsonKeys>(prop: P): PkgJson[ P ] => ctx.package[ prop ];

    const readDeps = async (test: boolean, excluded: Record<string, string>): Promise<Record<string, string>> => {
        const packages = await fs.readdir('node_modules').catch(_e => [] as string[]);

        const deps = await Promise.all(packages.map(async pkg => {
            if (!path.isAbsolute(pkg))
                return;

            if (test !== isTestPkg(pkg) || excluded[ pkg ])
                return;

            const pkgJsonFile = path.join(ctx.dirname, 'node_modules', pkg, 'package.json');

            const json: JSONSchemaForNPMPackageJsonFiles & { _requiredBy?: string[]; } = await fs.readJson(
                pkgJsonFile, { encoding: 'utf8' }
            ).catch(_e => ({}));

            if (!json.version) {
                console.warn(`Not adding package ${pkg} in package.json: "version field absent in ${pkg}/package.json"`);
                return;
            }

            if (!json._requiredBy?.some(req => req === '#USER'))
                return;

            return {
                pkg,
                version: ctx.config.get('save-exact') ? json.version : ctx.config.get('save-prefix') + json.version
            };
        }));


        return deps.filter(v => !!v).reduce((o, { pkg, version }) => ({ ...o, [ pkg ]: version }), {});
    };



    const pkgName = niceName(ctx.package.name || ctx.dirname);


    const getSpec = () => {
        try {
            return npa(pkgName);
        } catch (e) {
            return {} as npa.Result;
        }
    };

    const spec = getSpec();

    const getScope = () => {
        const scope = ctx.config.get('scope') || spec.scope;

        if (scope && scope.charAt(0) !== '@')
            return `@${scope}`;
    };


    const scope = getScope();

    const getPackageName = () => {
        if (scope)
            return `${scope}/${spec.name.split('/')[ 1 ]}`;

        return pkgName;
    };

    const packgeName = getPackageName();



    const getTestCommand = async (): Promise<string> => {
        const { test } = ctx.package.scripts || {};

        if (test)
            return test;

        const files = await fs.readdir(path.join(ctx.dirname, 'node_modules')).catch(_e => []);

        const commands = {
            tap: 'tap test/*.js',
            expresso: 'expresso test',
            mocha: 'mocha'
        };


        const testCommand = files.find(f => Object.keys(commands).some(c => c === f));

        return testCommand || 'echo "Error: no test specified" && exit 1';
    };



    const { name } = ctx.yes ? { name: packgeName } : await pkgPrompts({
        type: 'text',
        name: 'name',
        message: 'project name',
        initial: packgeName
    }, {
        validate: value => validatePackageName(value).error?.message || true
    });



    const directories = ctx.yes ? packageProp('directories') : await (async () => {

        const files: string[] = await fs.readdir(ctx.basename).catch(_e => []);

        const dirs = files.reduce((o, d) => {
            switch (d) {
                case 'example': case 'examples': o.example = d; break;
                case 'test': case 'tests': o.test = d; break;
                case 'doc': case 'docs': o.doc = d; break;
                case 'man': o.man = d; break;
                case 'lib': o.lib = d; break;
                default: break;
            }

            return o;
        }, {} as Record<string, string>);


        // undefined values are not written in package.json
        return Object.keys(dirs).length === 0 ? undefined : dirs;
    })();


    const dependencies = packageProp('dependencies') || await readDeps(false, packageProp('devDependencies') || {});
    const devDependencies = packageProp('devDependencies') || await readDeps(true, packageProp('dependencies') || {});


    const defaultTest = await getTestCommand();

    const scriptsTest = ctx.yes ? { test: defaultTest } : await prompts({
        type: 'text',
        name: 'test',
        message: 'script test',
        initial: defaultTest,
    });


    const { keywords } = ctx.yes ? { keywords: packageProp('keywords') } : await pkgPrompts({
        type: 'list',
        name: 'keywords',
        message: 'keywords',
        initial: (packageProp('keywords') || []).join(', ')
    });



    const getConfigAutor = () => {
        if (packageProp('author'))
            return packageProp('author');

        const getProp = (p: 'name' | 'email' | 'url') => ctx.config.get(`init.author.${p}`) || ctx.config.get(`init-author-${p}`);

        const [ name, email, url ] = [ 'name', 'email', 'url' ].map(getProp);

        if (name)
            return { name, email, url };

        return '';
    };

    const configAuthor = getConfigAutor();

    const { author } = ctx.yes ? { author: configAuthor } : await pkgPrompts({
        type: 'text',
        name: 'author',
        message: 'author',
        initial: flattenPerson(configAuthor),
        format: unflattenPerson
    });


    const getRepository = async () => {
        const content = await fs.readFile('.git/config', 'utf8').catch(_e => undefined);

        if (!content)
            return '';

        const getUrl = () => {
            const lines = content.split(/\r?\n/);
            const i = lines.indexOf('[remote "origin"]');

            if (i !== -1) {
                let url = lines[ i + 1 ];

                if (!url.match(/^\s*url =/))
                    url = lines[ i + 2 ];

                if (!url.match(/^\s*url =/))
                    return undefined;

                url = url.replace(/^\s*url = /, '');

                if (url.match(/^git@github.com:/))
                    url = url.replace(/^git@github.com:/, 'https://github.com/');

                return url;
            }

            return '';
        };

        return getUrl();
    };


    const { repository } = ctx.yes ? { repository: packageProp('repository') } : await pkgPrompts({
        type: 'text',
        name: 'repository',
        message: 'git repository',
        initial: await getRepository()
    });


    const configLicense = ctx.package.license ||
        ctx.config.get('init.license') ||
        ctx.config.get('init-license') ||
        ctx.config.get('defaults')?.[ 'init.license' ] ||
        'ISC';


    const { license } = ctx.yes ? { license: configLicense } : await pkgPrompts({
        type: 'text',
        name: 'license',
        message: 'license',
        initial: configLicense
    }, {
        validate: value => {
            const v = validateLicense(value);
            return v.validForNewPackages || v.warnings.join('');
        }
    });


    const getBin = async () => {
        const files = await fs.readdir(path.resolve(ctx.dirname, 'bin')).catch(_e => [] as string[]);
        const bin = files.filter(f => f.match(/\.js$/))[ 0 ];

        return bin;
    };

    const foundBin = await getBin();

    const { bin } = ctx.yes ? { bin: packageProp('bin') } : await pkgPrompts({
        type: 'text',
        name: 'bin',
        message: 'bin path',
        initial: foundBin
    });

    const configVersion = ctx.package.version ||
        ctx.config.get('init.version') ||
        ctx.config?.get('defaults')?.[ 'init.version' ] ||
        '1.0.0';

    const { version } = ctx.yes ? { version: configVersion } : await pkgPrompts({
        type: 'text',
        name: 'version',
        message: 'version',
        initial: configVersion,
        format: semver.valid
    });



    const { description } = ctx.yes ? { description: packageProp('description') } : await pkgPrompts({
        type: 'text',
        name: 'description',
        message: 'description'
    });


    const getMain = async () => {

        const files = (await fs.readdir(ctx.dirname).catch(_e => [] as string[])).filter(f => f.match(/\.js$/));

        const main = [ 'index.js', 'main.js', `${ctx.basename}.js` ].find(f => files.some(file => file === f));

        if (main)
            return main;

        return files[ 0 ] || 'index.js';
    };

    const defaultMain = await getMain();

    const { main } = ctx.yes ? { main: defaultMain } : await pkgPrompts({
        type: 'text',
        name: 'main',
        message: 'main',
        initial: defaultMain
    });


    const config = {
        name,
        version,
        license,
        description,
        keywords,
        author,
        bin,
        main,
        scripts: {
            ...scriptsTest
        },
        repository,
        directories,
        dependencies,
        devDependencies
    };


    return Object.entries(config).reduce((pkgJson, [ k, v ]) => {
        return { ...pkgJson, ...(v ? { [ k ]: v } : {}) };
    }, {});
};
