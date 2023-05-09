import { IsRefDoc } from "./is-ref-doc";
import firebase from "firebase/app";
export interface ParsedDocRef {
  fieldDotsPath: string;
  docRefPath: string;
}

export function parseDocGetAllRefs(obj: any): ParsedDocRef[] {
  const isObject = !!obj && typeof obj === "object";
  if (!isObject) {
    return [];
  }
  const foundDocRefs: ParsedDocRef[] = [];
  Object.keys(obj).map((key) => {
    const value = obj[key];
    recusivelyParseObjectValue(value, key, foundDocRefs);
  });
  return foundDocRefs;
}

export function recusivelyParseObjectValue(
  input: any,
  fieldPath: string,
  foundDocRefs: ParsedDocRef[]
): void {
  const isFalsey = !input;
  if (isFalsey) {
    return;
  }
  const isPrimitive = typeof input !== 'object';
  if (isPrimitive) {
    return;
  }
  const isArray = Array.isArray(input);
  if (isArray) {
    (input as []).map((value, index) =>
      recusivelyParseObjectValue(value, `${fieldPath}.${index}`, foundDocRefs)
    );
    return;
  }
  const isDocRefField = IsRefDoc(input);
  if (isDocRefField) {
    const refPath = (input as firebase.firestore.DocumentReference).path;
    foundDocRefs.push({
      fieldDotsPath: fieldPath,
      docRefPath: refPath
    });
    return;
  }
  Object.keys(input).map((key) => {
    const value = input[key];
    recusivelyParseObjectValue(value, `${fieldPath}.${key}`, foundDocRefs);
  });
  return;
}
