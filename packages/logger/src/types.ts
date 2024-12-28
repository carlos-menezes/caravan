export declare type TAnyValueScalar = string | number | boolean;
export declare type TAnyValueArray = Array<TAnyValue>;

export interface TAnyValueMap {
  [attributeKey: string]: TAnyValue;
}

export declare type TAnyValue =
  | TAnyValueScalar
  | Uint8Array
  | TAnyValueArray
  | TAnyValueMap
  | object
  | null
  | undefined;

type TExtendedRecord = Record<string | number | symbol, TAnyValue>;

export type { TExtendedRecord };
