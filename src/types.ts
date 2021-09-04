// eslint-disable-next-line import/no-extraneous-dependencies
// import { JSONSchemaForNPMPackageJsonFiles as PackageJson } from '@schemastore/package';
import { JSONSchemaForNPMPackageJsonFiles as PackageJson } from './pkg-json';

/* type RemoveIndex<T> = {
    [ P in keyof T as string extends P ? never : number extends P ? never : P ]: T[ P ]
};
 */
/* type KnownKeys<T> = {
    [ K in keyof T ]: string extends K ? never : number extends K ? never : K
} extends { [ _ in keyof T ]: infer U } ? U : never;


type PackageJsonNoIndex = Pick<PackageJson, KnownKeys<PackageJson>>;
 */

// Since Typescript 4.1 there is a way of doing this directly with Key Remapping
// It is based on the fact that 'a' extends string but string doesn't extends 'a'.

// type Pkg = Omit<PackageJsonNoIndex, 'homepage'> & { homepage: Record<string, any> | string; };

export type PkgJsonKeys = keyof PackageJson;
export type PkgJson = Pick<PackageJson, PkgJsonKeys>;

export type PromptTransform<T = any> = (data: string) => T | Error & { notValid?: boolean; } | null | undefined;

/* export interface Config {
    'save-exact';
    'save-prefix';
    scope;
}
 */
export interface InitContext {
    package: PackageJson;
    yes: boolean;
    filename: string;
    dirname: string;
    basename: string;
    config: { get: (k: string) => any; toJSON: () => Record<string, any>; };
    // prompt: <U = any, T = any>(question: string, defaultValue?: U, transform?: PromptTransform<T>) => string;
    // return string is this.unique + '-' + this.prompts.length defined in
    // https://github.com/npm/promzard/blob/8c37f2d873cf5686f4791cf89d0d0e662c8dceff/promzard.js#L143
}


// undefined and null values are not written in package.json
export type Callback<T = any> = (err: Error, res?: T | undefined | null) => void;

export type InitType = 'default' | 'upradata';
