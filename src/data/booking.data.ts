import { type Booking } from "@api/types";

let counter=0;

export function BuildBooking(overrides: Partial<Booking>={}):Booking{
    
    counter+=1;

    return{
         firstname: `John${counter}`,
          lastname: `Smith${counter}`,
          totalprice: 150,
          depositpaid: true,
          bookingdates: {
            checkin: '2026-01-01',
            checkout: '2027-01-01'
          },
          additionalneeds: 'Breakfast',
          //
          //...overrides,
    }
}

/**
 * Why a function, not a static exported object?
A static object (export const defaultBooking = {...}) is a shared reference — if one test mutates it (defaultBooking.firstname = 'X'), every other test importing it afterward sees the mutated version. That's a classic source of "my test passes alone but fails when run with others" bugs. A factory function returns a brand-new object every call — no shared state, no mutation risk. This is the same principle behind avoiding global/shared fixtures in general: test isolation.
Why Partial<Booking> for overrides?
Partial<T> is a TypeScript utility type that makes every property of Booking optional. This lets a test override just what it cares about without re-specifying the entire object:
tsconst payload = buildBooking({ totalprice: 500 }); // everything else stays default
Without Partial, you'd have to pass a complete Booking object just to change one field — defeating the point of having defaults at all.

Why the counter for firstname/lastname?
Cheap, dependency-free way to guarantee uniqueness across calls within a test run, without needing an extra library like faker. It's a pragmatic middle ground — real frameworks often reach for @faker-js/faker for more realistic random data (real-looking names, dates, etc.), and that's worth mentioning as a "next step" in an interview, but a counter is enough to demonstrate the concept of avoiding hardcoded duplicate data without adding a dependency.
Why ...overrides last (spread order matters)?
Object spread in JS/TS applies left-to-right, with later keys winning. Putting ...overrides after all the defaults means any field the caller explicitly passes wins over the default — this is the standard "defaults + overrides" merge pattern you'll see in most factory/builder implementations, worth being able to explain precisely (a common gotcha is reversing the order and silently having overrides do nothing
 */