import { FireStateOptions } from "../interfaces/FireStateOptions";
import { LevelLogger } from "./LevelLogger";

const logger = new LevelLogger("💸firestore-costs:");

const KEY_READS = "firecosts-doc-reads";
const KEY_WRITES = "firecosts-doc-writes";

export const LogNoOp = (...args: any) => null;

export interface IFirestoreLogger {
  LogWrites: (count: number) => Function;
  LogReads: (count: number) => Function;
  ResetCount: (shouldReset: boolean) => void;
}

export function MakeFirestoreLogger(
  options: FireStateOptions
): IFirestoreLogger {
  function notEnabled() {
    return !options || !options.logCosts;
  }

  function incrementRead(incrementBy = 1) {
    const currentCountRaw = localStorage.getItem(KEY_READS) || "";
    const currentCount = parseInt(currentCountRaw) || 0;
    const incremented = currentCount + incrementBy;
    localStorage.setItem(KEY_READS, incremented + "");
    return incremented;
  }
  function incrementWrite(incrementBy = 1) {
    const currentCountRaw = localStorage.getItem(KEY_WRITES) || "";
    const currentCount = parseInt(currentCountRaw) || 0;
    const incremented = currentCount + incrementBy;
    localStorage.setItem(KEY_WRITES, incremented + "");
    return incremented;
  }
  function clearCache() {
    localStorage.removeItem(KEY_READS);
    localStorage.removeItem(KEY_WRITES);
  }
  return {
    ResetCount(shouldReset: boolean) {
      shouldReset && clearCache();
    },
    LogWrites(docCount: number) {
      if (!docCount || notEnabled()) {
        return LogNoOp;
      }
      const count = incrementWrite(docCount);
      const suffix = `+${docCount} (session total=${count} document writes)`;
      const boundLogFn: (...args: any) => void = logger.logINFO.bind(
        console,
        suffix
      );
      return boundLogFn;
    },
    LogReads(docCount: number) {
      if (!docCount || notEnabled()) {
        return LogNoOp;
      }
      const count = incrementRead(docCount);
      const suffix = `+${docCount} (session total=${count} document reads)`;
      const boundLogFn: (...args: any) => void = logger.logINFO.bind(
        console,
        suffix
      );
      return boundLogFn;
    },
  };
}
