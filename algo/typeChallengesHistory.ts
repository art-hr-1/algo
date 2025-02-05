// Init
export type Expect<T extends true> = T
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false

// 
type LookUp<T extends {type: string}, S extends T["type"]> = T extends {type: S} ? T : never;

// 
type PromiseAll<T> = T extends [...(infer S)] ? S : 123
const promiseAll1 = Promise.resolve(3);
const promiseAll2 = 42;
const promiseAll3 = new Promise<string>((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});
type PromiseAllResult = PromiseAll<[typeof promiseAll1, typeof promiseAll2, typeof promiseAll3]>

// 191 - Append Argument
type AppendArgument<T, S> = T extends ((...args: infer Args) => infer Return) ? (...args: [...Args, S]) => Return : never

// 296 - Permutation
type Permutation<T, K=T> =
    [T] extends [never]
      ? []
      : K extends K
        ? [K, ...Permutation<Exclude<T, K>>]
        : never

type perm = Permutation<'A' | 'B' | 'C'>; // ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']

// 
type loopUnion<Union extends string, Item extends string = Union> = Item extends Item ? `loop ${Item}` : never;
type loopResult = loopUnion<"A" | "B" | "C">; // "loop A" | "loop B" | "loop C" 

// 529 - Absolute
type Absolute<T extends number | bigint> = `${T}` extends `-${infer U}` ? U : T

// 645 - diff
type DiffFoo = {
  name: string
  age: string
}
type DiffBar = {
  name: string
  age: string
  gender: number
}
type Diff<T, U> = {
  // [k in keyof (Omit<T, keyof U> & Omit<U, keyof T>)]: (T & U)[k]
  [k in keyof (T & U) as k extends keyof (T | U) ? never : k]: (T & U)[k]
}

type DiffResult = Diff<DiffFoo, DiffBar>

// 1042 - isNever
type IsNever<T> = [T] extends [never] ? true : false 