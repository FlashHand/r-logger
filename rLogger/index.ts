import axios, {AxiosInstance, AxiosRequestConfig} from "axios";

interface IRLoggerConfig{
	endpoint:string;
	axiosConfig?: AxiosRequestConfig;
}


export class RLogger<U= void,BasicPayload extends U =U>{
	private queue: any[] = [];
	private uploading = false;
	private concurrency = 5;
	endpoint = '';
	private closed = false;
	private key = 'r-logger-queue';
	private client: AxiosInstance;
	basicPayload: BasicPayload;
	interceptor?: (payload :any) => any
	private readonly axiosConfig?:AxiosRequestConfig={
		headers: {"Content-Type": "application/json"},
		timeout:60000
	}

	constructor(config:IRLoggerConfig) {
		this.endpoint = config.endpoint;
		if (config.axiosConfig) this.axiosConfig = config.axiosConfig;
		this.client = axios.create(this.axiosConfig);
	}

	//加载持久化队列
	private loadQ(){
		try{
			if (typeof localStorage !=='undefined'){
				const savedQ = localStorage.getItem(this.key);
				if (savedQ){
					this.queue = JSON.parse(savedQ);
				}
			}
		}catch (e){
			console.error(`loadQ:${e.message}`);
		}
	}
	//开始上传队列

	private startUpload(){
		if(this.uploading){
			return;
		}
		if (this.queue.length ===0){
			return;

		}
		const payloadArr = this.queue.splice(0, this.concurrency);
		this.upload(payloadArr);
	}
	upload(payloadArr:any[]){
		this.uploading = true;
		try {
			// await this
		}catch (e){

		}
	}
	send(customPayload:any,config:any,level:'info'|'warn'|'error'='info'){
		let payloadArr = Array.isArray(customPayload) ?
			customPayload.map(p => Object.assign({}, this.basicPayload, p, {_lv: level})) :
			[Object.assign({}, this.basicPayload, customPayload, {_lv: level})];
		if (this.interceptor) payloadArr = this.interceptor(payloadArr);
	}


}