export type Class = { new(...args: any[]): any }

export function instantiate<T>(constr: Class, ...args: any[]): T {
    return new constr(...args);
}