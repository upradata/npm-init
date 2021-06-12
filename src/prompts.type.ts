import type P from '../node_modules/@types/prompts/index.d';

export type GetType<T extends P.PromptType | P.Falsy> = T extends P.Falsy ? never :
    T extends 'text' | 'password' | 'invisible' | 'toggle' | 'select' | 'autocomplete' ? string :
    T extends 'number' ? number :
    T extends 'date' ? Date :
    T extends 'confirm' ? boolean :
    T extends 'multiselect' | 'list' | 'autocompleteMultiselect' ? string[] :
    never;


export type EnsureArray<T> = T extends any[] ? T : [ T ];
export type ValueOf<T> = T extends (infer U)[] ? U : T;
export type TT$<T> = T | Promise<T>;

export type ValueOf$<T> = T extends Promise<infer U> ? U : T;
export type Value<N> = ValueOf$<N extends (...args: any[]) => any ? ReturnType<N> : N>;
