import type P from '../../node_modules/@types/prompts/index.d';
import { EnsureArray, GetType, Value } from '../prompts.type';

type Prop<O extends PromptO<any, any>> = {
    [ K in Value<O[ 'name' ]> ]: 'format' extends keyof O ? ReturnType<O[ 'format' ]> : GetType<Value<O[ 'type' ]>>
};

type Props<A extends Array<PromptO<any, any>>> = {
    [ K in number ]: Prop<A[ K ]>;
}[ number ];



export type PromptO<K extends string = string, U = never> = Omit<P.PromptObject<K>, 'format' | 'suggest'> & {
    format?: (value: any) => U;//  <P extends PromptO<K>, U>(value: GetType<Value<P[ 'type' ]>> /* , values: PromptsReturn<PromptsQuestions<K, U>> */) => U; // Format<K, U>;
    suggest?: ((input: any, choices: P.Choice[]) => Promise<P.Choice[]>);
};


export type PromptsQuestions<K extends string, U = never> = PromptO<K, U> | PromptO<K, U>[];
export type PromptsReturn<Q extends PromptsQuestions<string, any>> = Props<EnsureArray<Q>>;


export type Prompts<Keys extends string = string> = <Q extends PromptsQuestions<Keys, U>, U>(
    questions: Q,
    options?: P.Options
) => Promise<PromptsReturn<Q>>;


declare const prompts: Prompts;
export default prompts;
