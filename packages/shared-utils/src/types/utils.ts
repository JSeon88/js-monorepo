/**
 * 값 타입: 객체의 모든 값에 대한 유니온 타입입니다.
 * 제네릭 타입 T의 모든 값에 대한 유니온 타입을 생성합니다.
 */
export type ValueOf<T> = T[keyof T];

/**
 * 키 타입: 객체 T에서 값 타입이 V인 모든 키에 대한 유니온 타입입니다.
 * 제네릭 타입 T와 값 타입 V에 따라 객체 T의 키 중 값이 V인 키에 대한 유니온 타입을 생성합니다.
 */
export type KeyOfType<T, V> = keyof {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};

/**
 * Nullable 타입: T | null 유니온 타입입니다.
 * 제네릭 타입 T에 대해 T 또는 null을 포함하는 유니온 타입을 생성합니다.
 */
export type Nullable<T> = T | null;

/**
 * Optional 타입: T | undefined 유니온 타입입니다.
 * 제네릭 타입 T에 대해 T 또는 undefined를 포함하는 유니온 타입을 생성합니다.
 */
export type Optional<T> = T | undefined;

/**
 * Maybe 타입: T | null | undefined 유니온 타입입니다.
 * 제네릭 타입 T에 대해 T 또는 null 또는 undefined를 포함하는 유니온 타입을 생성합니다.
 */
export type Maybe<T> = T | null | undefined;

/**
 * PlainObject 타입: 키가 PropertyKey이고 값이 unknown인 객체입니다.
 * PropertyKey는 문자열 또는 심볼입니다.
 */
export type PlainObject = {[key: PropertyKey]: unknown};

/**
 * PlainArray 타입: unknown 타입의 배열입니다.
 */
export type PlainArray = unknown[];
