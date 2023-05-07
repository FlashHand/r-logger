interface SLSOption {
    host: string;
    project: string;
    logstore: string;
    time?: number;
    count?: number;
}
declare class SlsHelper {
    host: string;
    project: string;
    logstore: string;
    time: number;
    count: number;
    queue: any[];
    timer: null | ReturnType<typeof setTimeout>;
    get endpoint(): string;
    resetTimer(): void;
    constructor(option: SLSOption);
    requestTrack(): void;
    push(log: any): void;
    send(log: any): void;
}
export default SlsHelper;
