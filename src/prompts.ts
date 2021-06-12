import originalPrompts from 'prompts';
/* eslint-disable no-redeclare */
import { Readable, Writable } from 'stream';
import type P from '../node_modules/@types/prompts/index.d';
import { GetType, Value, ValueOf, TT$ } from './prompts.type';

type PrompFunc2<T1 = any, T2 = any, R = any> = (a1: T1, a2: T2) => R;


type Prop<O extends PromptObjectBase> = {
    [ K in Value<O[ 'name' ]> ]: 'format' extends keyof O ? ReturnType<O[ 'format' ]> : GetType<Value<O[ 'type' ]>>;
};


export type Answer<Q extends PromptObjectBase> = Prop<Q>;


type PromptObjectBase<N extends string = string, T extends P.PromptType = P.PromptType, F extends PrompFunc2 = PrompFunc2> = {
    name: TT$<N>;
    type: TT$<T>;
    format?: F;
};


export type Question<N extends string = string, T extends P.PromptType = P.PromptType> = {
    type: TT$<T>;
    name: TT$<N>;
    message?: TT$<string>;
    initial?: TT$<GetType<T>>;
    suggest?: ((input: any, choices: P.Choice[]) => Promise<P.Choice[]>);
    style?: TT$<string>;
    // onState?: PrevCaller<Q & U, void>>;
    min?: TT$<number>;
    max?: TT$<number>;
    float?: TT$<boolean>;
    round?: TT$<number>;
    instructions?: TT$<string | boolean>;
    increment?: TT$<number>;
    separator?: TT$<string>;
    active?: TT$<string>;
    inactive?: TT$<string>;
    choices?: TT$<P.Choice[]>;
    hint?: TT$<string>;
    warn?: TT$<string>;
    limit?: TT$<number>;
    mask?: TT$<string>;
    stdout?: Writable;
    stdin?: Readable;
};

/* type PrevCaller<P extends PromptObjectBase, T> = (prev: any, answers: Answers<P>, prompt: P.PromptObject) => T;

type FF<Q extends Question, U> = { format: PrompFunc2<Q[ 'type' ], any, U>; };
type FFS<Q extends Questions, U> = { format: PrompFunc2<Q[ 'type' ], any, U>; }; */

export type Post<Q extends Question, U> = {
    format?: (value: GetType<Value<ValueOf<Q>[ 'type' ]>> /* , answers: A */) => U;
    validate?: (value: GetType<Value<ValueOf<Q>[ 'type' ]>>) => boolean;
    initial?: ValueOf<Q>[ 'type' ]; // | PrevCaller<Q & U, ValueOf<Q>[ 'type' ]>;
    // | PrevCaller<Q & U, string>;

    /*  suggest?: ((input: any, choices: P.Choice[]) => Promise<P.Choice[]>);
     style?: string; // | PrevCaller<Q & U, string | P.Falsy>;
     // onState?: PrevCaller<Q & U, void>;
     min?: number; // | PrevCaller<Q & U, number | P.Falsy>;
     max?: number; // | PrevCaller<Q & U, number | P.Falsy>;
     float?: boolean; // | PrevCaller<Q & U, boolean | P.Falsy>;
     round?: number; // | PrevCaller<Q & U, number | P.Falsy>;
     instructions?: string | boolean;
     increment?: number; // | PrevCaller<Q & U, number | P.Falsy>;
     separator?: string; // | PrevCaller<Q & U, string | P.Falsy>;
     active?: string; // | PrevCaller<Q & U, string | P.Falsy>;
     inactive?: string;//  | PrevCaller<Q & U, string | P.Falsy>;
     choices?: P.Choice[]; // | PrevCaller<Q & U, P.Choice[] | P.Falsy>;
     hint?: string; // | PrevCaller<Q & U, string | P.Falsy>;
     warn?: string; // | PrevCaller<Q & U, string | P.Falsy>;
     limit?: number; // | PrevCaller<Q & U, number | P.Falsy>;
     mask?: string; // | PrevCaller<Q & U, string | P.Falsy>; */
};


export interface Prompts<Keys extends string = string> {
    <Q extends Question<Keys>>(question: Q, options?: P.Options): Promise<Answer<Q>>;
    <Q extends Question<Keys>, P extends Post<Q, any>>(question: Q, post: P, options?: P.Options): Promise<Answer<Q & P>>;
}


/* const f = async () => {
    const p = prompts<'k1' | 'k2'>();

    const r = await p({
        name: 'k1',
        type: 'list',
        message: 'message'
    }, {
        format: v => [ ...v ].length,
    });

    return r.k1;
};


const f2 = async () => {
    const p = prompts<'k1' | 'k2'>();

    const r = await p({
        name: 'k1',
        type: 'list',
        message: 'message'
    });

    const { k1 } = await p({
        name: 'k1',
        type: 'list',
        message: 'message'
    });

    return r.k1.length + k1.length;
}; */


export const makePrompts = <Keys extends string>() => ((question, post, options) => {
    return originalPrompts({ ...question, ...post } as any, options);
}) as Prompts<Keys>;


const prompts = makePrompts<string>();
export default prompts;
