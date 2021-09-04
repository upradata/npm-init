import fs from 'fs-extra';
import path from 'path';
import { formatPkgName, formatRepoUrl } from '../../../src/init-config/upradata.init';
import { mockPrompts } from '../../util';


jest.setTimeout(10000);


describe('should write upradata.init package.json', () => {


    beforeEach(() => {
        jest.resetModules();
        const processSpy = jest.spyOn(process, 'cwd');
        processSpy.mockReturnValue(__dirname);
    });


    it('init default yes should work', async () => {

        mockPrompts([
            Promise.resolve({ yes: true }),
            Promise.resolve({ key: 'upradata' }),
            Promise.resolve({ name: '@upradata/test' })
        ]);

        const { init } = await import('../../../src/init');

        const result = await init({ mode: 'data' }).catch(_e => ({}));

        const expected = {
            data: await fs.readJSON(path.join(__dirname, '/package.upradata.default.json')),
            path: path.join(__dirname, '/package.json'),
            isNew: true
        };

        expect(result).toEqual(expected);
    });



    it('init with custom answers should work', async () => {

        mockPrompts([
            Promise.resolve({ yes: false }),
            Promise.resolve({ key: 'upradata' }),
            Promise.resolve({ name: formatPkgName('test') }),
            Promise.resolve({ repository: { url: formatRepoUrl('test') } }),
            Promise.resolve({ homepage: 'www.test.com' }),
            Promise.resolve({ description: 'une petite description' }),
            Promise.resolve({ keywords: [ 'upradata', 'typescript', 'ts', 'key1', 'key2', 'key3' ] })
        ]);

        const { init } = await import('../../../src/init');

        const result = await init({ mode: 'data' }).catch(_e => ({}));

        const expected = {
            data: await fs.readJSON(path.join(__dirname, '/package.upradata.json')),
            path: path.join(__dirname, '/package.json'),
            isNew: true
        };

        expect(result).toEqual(expected);
    });

});
