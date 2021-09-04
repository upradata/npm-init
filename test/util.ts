export const mockPrompts = (answers: Promise<{ [ K: string ]: any; }>[]) => {
    const mockPrompts = answers.reduce((fn, answer) => fn.mockReturnValueOnce(answer), jest.fn());

    return jest.mock('prompts', jest.fn().mockImplementation(() => ({
        __esModule: true,
        default: mockPrompts
    })));
};
