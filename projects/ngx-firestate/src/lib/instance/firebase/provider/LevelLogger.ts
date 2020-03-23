const blankLogger = (...any) => {};

export class LevelLogger {
  private loggerID = Math.random()
    .toString(32)
    .slice(2, 6);

  constructor(private prefix: string, private level: number = 0) {}

  private getLogString(msg: string) {
    return `֍ ngx-firestate:: ${this.prefix} [${this.loggerID}][${msg}]`;
  }

  public get logINFO() {
    if (this.level < 1) {
      return blankLogger;
    }
    const boundLogFn: (...any) => void = console.log.bind(
      console,
      this.getLogString('info'),
    );
    return boundLogFn;
  }

  public get logDEBUG() {
    if (this.level < 2) {
      return blankLogger;
    }
    const boundLogFn: (...any) => void = console.log.bind(
      console,
      this.getLogString('debug'),
    );
    return boundLogFn;
  }

  public get logERROR() {
    if (this.level < 1) {
      return blankLogger;
    }
    const boundLogFn: (...any) => void = console.error.bind(
      console,
      this.getLogString('error'),
    );
    return boundLogFn;
  }
}
