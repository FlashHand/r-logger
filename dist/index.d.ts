import { AxiosRequestConfig } from "axios";
interface IRLoggerConfig {
    endpoint: string;
    axiosConfig?: AxiosRequestConfig;
}
interface IUploadConfig {
    immediate?: boolean;
}
interface ICommonPayload {
    category: string;
    label?: string;
    action?: string;
    tag?: string;
    count?: number;
    [key: string]: any;
}
export declare class RLogger<U = void, BasicPayload extends U = U> {
    private queue;
    private uploading;
    private concurrency;
    endpoint: string;
    private closed;
    private key;
    private client;
    basicPayload?: BasicPayload;
    interceptor?: (payload: any) => any;
    private readonly axiosConfig?;
    constructor(config: IRLoggerConfig);
    private loadQ;
    private startUpload;
    upload(payloadArr: any[]): Promise<void>;
    send(customPayload: ICommonPayload, config?: IUploadConfig, level?: 'info' | 'warn' | 'error'): void;
    saveQueue(): void;
    setEndpoint(endpoint: string): void;
    setInterceptor(interceptor: (payload: any) => any): void;
    setBasicPayload(basicPayload: any): void;
    uploadOnIdle(): void;
}
export declare const defaultLogger: RLogger<void, void>;
export declare const aliLogger: RLogger<void, void>;
export {};
