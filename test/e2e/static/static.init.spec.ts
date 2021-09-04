import path from 'path';
import fs from 'fs-extra';
import { mockPrompts } from '../../util';

jest.setTimeout(10000);


describe('should write upradata.init package.json', () => {


    beforeEach(() => {
        jest.resetModules();
        const processSpy = jest.spyOn(process, 'cwd');
        processSpy.mockReturnValue(__dirname);
    });


    it('init should work', async () => {

        mockPrompts([
            Promise.resolve({ yes: true }),
            Promise.resolve({ key: 'static' }),
        ]);

        const { init } = await import('../../../src/init');

        const result = await init({ mode: 'data' }).catch(_e => ({}));

        const expected = {
            data: await fs.readJSON(path.join(__dirname, '/package.static.json')),
            path: path.join(__dirname, '/package.json'),
            isNew: true
        };

        expect(result).toEqual(expected);
    });
});
