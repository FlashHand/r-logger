import axios, {AxiosInstance, AxiosRequestConfig} from "axios";
import md5 from 'js-md5';
import {nanoid} from "nanoid";

interface IRLoggerConfig {
	endpoint: string;
	axiosConfig?: AxiosRequestConfig;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const genDeviceID = () => {
	let d = localStorage.getItem('r-logger-device-id');
	if (!(d && d.length === 32)) {
		d = md5(nanoid(32) + navigator.userAgent);
		localStorage.setItem('r-logger-device-id', d);
	}
	return d;
}

interface IUploadConfig {
	immediate?: boolean
}

//通用日志字段
interface ICommonPayload {
	//分类->标签->行为
	category: string;//分类
	label?: string;//标签
	action?: string;//行为
	tag?:string;//特殊标记,无特殊层级关系
	count?: number;//用于计数
	[key: string]: any;
}

export class RLogger<U = void, BasicPayload extends U = U> {
	private queue: any[] = [];
	private uploading = false;
	private concurrency = 5;
	endpoint = '';
	private closed = false;
	private key = 'r-logger-queue';
	private client: AxiosInstance;
	basicPayload?: BasicPayload;
	interceptor?: (payload: any) => any
	private readonly axiosConfig?: AxiosRequestConfig = {
		headers: {"Content-Type": "application/json"},
		timeout: 60000
	}

	constructor(config: IRLoggerConfig) {
		this.endpoint = config.endpoint;
		if (config.axiosConfig) this.axiosConfig = config.axiosConfig;
		this.client = axios.create(this.axiosConfig);
		this.loadQ();
	}

	//加载持久化队列
	private loadQ() {
		try {
			if (typeof localStorage !== 'undefined') {
				const savedQ = localStorage.getItem(this.key);
				if (savedQ) {
					this.queue = JSON.parse(savedQ);
				}
			}
		} catch (e: any) {
			console.error(`loadQ:${e.message}`);
		}
	}

	//开始上传队列

	private startUpload() {
		if (this.uploading) {
			return;
		}
		if (this.queue.length === 0) {
			return;

		}
		const payloadArr = this.queue.splice(0, this.concurrency);
		this.upload(payloadArr);
	}

	async upload(payloadArr: any[]) {
		this.uploading = true;
		try {
			await this.client.post(this.endpoint, payloadArr);
		} catch (e) {

		}
		this.saveQueue();
		await sleep(5000);
		this.uploading = false;
		this.startUpload();
	}

	send(customPayload:  ICommonPayload, config?: IUploadConfig, level: 'info' | 'warn' | 'error' = 'info') {
		const defaultPayload = {
			_d: genDeviceID(),
		}
		let payloadArr = Array.isArray(customPayload) ?
			customPayload.map(p => Object.assign({}, defaultPayload, this.basicPayload, p, {_lv: level})) :
			[Object.assign({}, defaultPayload, this.basicPayload, customPayload, {_lv: level})];
		let payload: any;
		if (this.interceptor) payload = this.interceptor(payloadArr);
		console.log(payload);
		if (config?.immediate) {
			try {
				this.client.post(this.endpoint, payload);
			} catch (e) {
				console.error(e);
			}
		} else {
			this.queue.push(...payloadArr);
			this.saveQueue();
			this.uploadOnIdle();
		}
	}

	saveQueue() {
		try {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(this.key, JSON.stringify(this.queue));
			}
		} catch (e) {

		}
	}


	setEndpoint(endpoint: string) {
		this.client.defaults.baseURL = endpoint;
		this.endpoint = endpoint;
	}

	setInterceptor(interceptor: (payload: any) => any) {
		this.interceptor = interceptor;
	}

	setBasicPayload(basicPayload: any) {
		this.basicPayload = basicPayload;
	}

	uploadOnIdle() {
		if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
			requestIdleCallback(() => {
				this.startUpload();
			})
		} else {
			this.startUpload();
		}
	}


}

export const defaultLogger = new RLogger({
	endpoint: '',
	axiosConfig: {
		headers: {"Content-Type": "application/json"}
	}
});
export const aliLogger = new RLogger({
	endpoint: '',
	axiosConfig: {
		headers: {
			Accept: '*/*',
			'Content-Type': 'application/json',
			'x-log-apiversion': '0.6.0',
			'x-log-bodyrawsize': 1
		}
	}
});
aliLogger.setInterceptor((payload: any) => {
	return {
		__logs__: payload
	}
})

