import { VerboseLevel } from "./types/VerboseLevel";

export class Logger {
  private readonly verboseLevel: VerboseLevel;
  constructor(verboseLevel?: VerboseLevel) {
    this.verboseLevel = verboseLevel ? verboseLevel : VerboseLevel.INFO;
  }

  public info(msg: string) {
    if (this.verboseLevel < VerboseLevel.INFO) {
      return;
    }
    console.log(msg);
  }

  public debug(msg: string) {
    if (this.verboseLevel < VerboseLevel.DEBUG) {
      return;
    }
    console.log(msg);
  }
}
