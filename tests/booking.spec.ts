import {test,expect} from '@fixtures/api.fixtures'
import{bookingSchema} from '@schemas/booking.schema';
import {BuildBooking} from '@data/booking.data'
import { validateSchema } from '@assertions/schema';
import { type BookingResponse } from '@api/types';

test.describe('booking API tests', ()=>{
    test('should create a new booking',async ({bookingApi})=>{
        //generating the payload 
        const payload=BuildBooking();
        //
        const response= await bookingApi.create(payload);
        expect ( response.status()).toBe(200);

        const responsebody:BookingResponse  = await response.json();
        console.log(responsebody);
        expect(responsebody.booking).toMatchObject(payload)
    })
})
