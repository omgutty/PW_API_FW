/**
 * Methods return APIResponse, not the parsed body. 
 * This is deliberate — the service object's job is "make the call correctly,
 * " not "decide what the test should assert." Returning the raw response lets 
 * the test decide whether to check status code, headers, or parse the body — 
 * keeping assertion logic out of the service layer. (Compare this to AuthApi.createToken(), 
 * which does parse and return just the token — because a token is an internal implementation 
 * detail the auth flow needs, not something a test typically asserts on directly. 
 * That inconsistency is worth noticing, and I'm happy to discuss the trade-off if you want.)
 * 
 * No env.baseUrl used anywhere here. 
 * Because baseURL is already configured once in playwright.config.ts, 
 * and request (injected via fixture, which we build next) is already scoped to it. 
 * Every path here is relative (/booking, not the full URL) — this is the payoff of centralizing baseURL
 * 
 */

import {type  APIRequestContext , type APIResponse} from '@playwright/test';
import { endpoints } from './endpoints';
import { type Booking } from './types';

export class BookingApi {
    constructor(private request:APIRequestContext){
    }

    async create(payload:Booking):Promise<APIResponse>{
        return this.request.post(endpoints.booking,{data:payload})
    }

    async getbyid(id:number):Promise<APIResponse>{
        return this.request.get(endpoints.bookingById(id));
    }

    async udpate(id:number,payload:Booking,token:string):Promise<APIResponse>{
        return this.request.put(endpoints.bookingById(id),{
            data:payload,
            headers:{Cookie:`token=${token}`}
        })
    }

    async delete(id:number,token:string):Promise<APIResponse>{
        return this.request.delete(endpoints.bookingById(id),{
            headers: {coockies:`token=${token}`}
        })
    }
}