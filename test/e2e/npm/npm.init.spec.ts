
import fs from 'fs-extra';
import path from 'path';
import { unflattenPerson } from '../../../src/util';
import { mockPrompts } from '../../util';


jest.setTimeout(10000);


describe('should write npm.init package.json', () => {


    beforeEach(() => {
        jest.resetModules();
        const processSpy = jest.spyOn(process, 'cwd');
        processSpy.mockReturnValue(__dirname);
    });


    it('init default yes should work', async () => {

        mockPrompts([
            Promise.resolve({ yes: true }),
            Promise.resolve({ key: 'npm' })
        ]);

        const { init } = await import('../../../src/init');

        const result = await init({ mode: 'data' }).catch(_e => ({}));

        const expected = {
            data: await fs.readJSON(path.join(__dirname, '/package.npm.default.json')),
            path: path.join(__dirname, '/package.json'),
            isNew: true
        };

        expect(result).toEqual(expected);
    });


    it('init with custom answers should work', async () => {

        mockPrompts([
            Promise.resolve({ yes: false }),
            Promise.resolve({ key: 'npm' }),
            Promise.resolve({ name: 'test' }),
            Promise.resolve({ test: 'jest --runInBand --passWithNoTests --verbose false --config jest-ut.config.js' }),
            Promise.resolve({ keywords: [ 'key1', 'key2', 'key3' ] }),
            Promise.resolve({ author: unflattenPerson('Thomas Milotti <thomas.milotti@gmail.com> (https://github.com/milottit)') }),
            Promise.resolve({ repository: 'https://github.com/upradata/test' }),
            Promise.resolve({ license: 'MIT' }),
            Promise.resolve({ bin: 'bin/index.js' }),
            Promise.resolve({ version: '1.0.0' }),
            Promise.resolve({ description: 'une petite description' }),
            Promise.resolve({ main: 'index.js' })
        ]);

        const { init } = await import('../../../src/init');

        const result = await init({ mode: 'data' }).catch(_e => ({}));

        const expected = {
            data: await fs.readJSON(path.join(__dirname, '/package.npm.json')),
            path: path.join(__dirname, '/package.json'),
            isNew: true
        };

        expect(result).toEqual(expected);
    });

});
