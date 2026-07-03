import {test,expect} from '@fixtures/api.fixtures'
import{bookingSchema} from '@schemas/booking.schema';
import {BuildBooking} from '@data/booking.data'
import { validateSchema } from '@assertions/schema';
import { Booking, type BookingResponse } from '@api/types';
import { endpoints } from '../src/api/endpoints';

test.describe('booking API tests', ()=>{
    test('should create a new booking',async ({bookingApi})=>{
        //generating the payload 
        const payload:Booking=BuildBooking();
        //
        const response= await bookingApi.create(payload);
        expect ( response.status()).toBe(200);

        const responsebody:BookingResponse  = await response.json();
        console.log(responsebody);
        expect(responsebody.booking).toMatchObject(payload as unknown as Record<string, unknown>);
        /**
         * unknown is special — it's TypeScript's "top type," meaning everything can be cast to unknown, 
         * and unknown can be cast to anything else. So payload as unknown first "resets" the type to the 
         * most generic possible type (no overlap-checking needed, since unknown is deliberately compatible with everything), 
         * and then as Record<string, unknown> casts from there. It's TypeScript's built-in way of saying "I'm deliberately overriding 
         * your safety check, I've verified this myself."
         
        expect(responsebody.booking.firstname).toBe(payload.firstname);
        expect(responsebody.booking.lastname).toBe(payload.lastname);
        expect(responsebody.booking.totalprice).toBe(payload.totalprice);
        expect(responsebody.booking.depositpaid).toBe(payload.depositpaid);
        expect(responsebody.booking.bookingdates).toEqual(payload.bookingdates);
        expect(responsebody.booking.additionalneeds).toBe(payload.additionalneeds);
        */
    });

    test('Should fetch the booking and match the response schema', async ({bookingApi})=>{
        const payload=BuildBooking()
        const response=await bookingApi.create(payload);
        expect (response.status()).toBe(200);
        
        const body:BookingResponse = await response.json();
        const bookingid = body.bookingid;

        console.log(body, bookingid)
        
        const getresponse=await bookingApi.getbyID(bookingid);
        expect(getresponse.status()).toBe(200);

        console.log(getresponse);
       
        const getresponsebody=await getresponse.json()
        console.log(getresponsebody);
        

        validateSchema(bookingSchema,getresponsebody)
        expect(getresponse.headers()['content-type']).toContain('application/json');
    })

    test('should update a booking',async ({bookingApi,authToken})=>{
        const original=BuildBooking()
        const creatresponse = await bookingApi.create(original);
        const {bookingid} = await creatresponse.json()
        
        const updatedPayload =BuildBooking({totalprice:145});
        console.log(updatedPayload.totalprice)
        
        const updateResponse = await bookingApi.udpate(bookingid,updatedPayload,authToken)
        expect( updateResponse.status()).toBe(200);

        const updatedResponseBody = await updateResponse.json()
        expect(updatedResponseBody.totalprice).toBe(145)
    })

    test('should delete a booking', async ({bookingApi, authToken})=>{
        const payload= BuildBooking();
        const response= await bookingApi.create(payload);
        const {bookingid}=  await response.json()

        const deleteresponse = await bookingApi.delete(bookingid,authToken);
        expect(deleteresponse.status()).toBe(201);
        const getResponse = await bookingApi.getbyID(bookingid);
        expect(getResponse.status()).toBe(404);
    })
})
