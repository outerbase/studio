export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

/**
 * Make some properties of T optional
 *
 * @example
 * type User = {
 *  id: string;
 *  name: string;
 *  age: number;
 * };
 *
 * type PartialUser = MakeOptional<User, "age" | "name">;
 * // { id: string; name?: string | undefined; age?: number | undefined; }
 *
 */
export type MakeOptional<T, K extends keyof T> = Prettify<
  Omit<T, K> & Partial<Pick<T, K>>
>;
