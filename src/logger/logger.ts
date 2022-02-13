export class Logger {
    private suppressOutput: boolean;

    constructor(suppressOutput: boolean) {
        this.suppressOutput = suppressOutput;
    }

    public log(message: string): void {
        if (this.suppressOutput) return;
        console.log(message);
    }
}
