import { WhereFilterOp } from '@firebase/firestore-types';

export interface QueryObj {
  fieldPath: string;
  opStr: WhereFilterOp;
  value: any;
}
