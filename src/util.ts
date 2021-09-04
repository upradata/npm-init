import { URL } from 'url';
import validateName from 'validate-npm-package-name';
import { ExtendedPerson, PlainPerson } from './pkg-json';
import { makePrompts } from './prompts';
import { PkgJsonKeys } from './types';


export const niceName = (n: string) => {
    return n.replace(/^node-|[.-]js$/g, '').replace(/\s+/g, ' ').replace(/ /g, '-').toLowerCase();
};


export const pkgPrompts = makePrompts<PkgJsonKeys>();

export const validatePackageName = (name: string) => {
    const its = validateName(name);

    if (its.validForNewPackages)
        return { name, isValid: true };

    const errors = (its.errors || []); // .concat(its.warnings || []);
    const error = new Error(`Sorry, ${errors.join(' and ')}.`);

    return { error, isValid: false };
};


export const validateUrl = (value: string, protocols?: string[]) => {
    try {
        const url = new URL(value);

        if (protocols)
            return url.protocol ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol) : false;

        return true;

    } catch (err) {
        return false;
    }
};


// flatten => "Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"

export const flattenPerson = (person: string | ExtendedPerson): string => {
    if (typeof person === 'string')
        return person;

    const { name = '', url, web, email, mail } = person;

    const u = url || web;
    const formattedUrl = u ? (` (${u})`) : '';

    const e = email || mail;
    const formattedEmail = e ? (` <${e}>`) : '';

    return name + formattedEmail + formattedUrl;
};



const personRx = {
    email: /<(.*)>/,
    url: /\((.*)\)/,
    name: /^([^<(].*?)\s*[<(]/
};


export const unflattenPerson = (person: string | ExtendedPerson): PlainPerson => {
    if (typeof person !== 'string')
        return person;

    const name = person.match(personRx.name)?.[ 1 ];
    const url = person.match(personRx.url)?.[ 1 ];
    const email = person.match(personRx.email)?.[ 1 ];

    return { name, url, email };
};


// turn the objects into somewhat more humane strings.
export const flattenPeople = (data: Record<'author' | 'maintainers' | 'contributors', string | ExtendedPerson>) => {
    return Object.fromEntries(Object.entries(data).map(
        ([ k, p ]) => [ k, Array.isArray(p) ? p.map(flattenPerson) : flattenPerson(p) ])
    );
};
