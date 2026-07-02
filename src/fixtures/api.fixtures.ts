/**
 *  The core idea: extending test
Playwright's base test object only knows about built-in fixtures (page, request, browser, etc.). test.extend() lets you add your own — here, authApi, bookingApi, and authToken
 */

import {test as base} from '@playwright/test';
import { AuthApi } from '@api/authApi';
import { BookingApi } from '@api/bookingApi';

interface ApiFixture{
    authApi: AuthApi,
    bookingApi: BookingApi,
    authToken:string;
}

export const test = base.extend<ApiFixture>({
    authApi: async({request},use)=>{
        const authApi= new AuthApi(request)
        return use(authApi)
    }, 
    bookingApi:async ({request},use)=>{
        const bookingapi=new BookingApi(request);
        return use(bookingapi);
    },
    authToken: async ({ authApi }, use) => {
        const token = await authApi.createtoken();
        await use(token);
  },
})


export { expect } from '@playwright/test';

/**
 * Why base.extend<ApiFixtures>({...}) and not just writing helper functions?
You could write a plain function function createBookingApi(request) { return new BookingApi(request) } 
and call it manually in every test. The reason fixtures are better: Playwright manages lifecycle and 
dependency resolution automatically. Notice authToken depends on authApi — Playwright sees that
 dependency in the destructured argument { authApi } and automatically builds authApi first, 
 then hands it to authToken. You never manually sequence "build auth, then get token, 
 then build booking API" — Playwright's fixture graph does it for you, and only builds 
 what a given test actually asks for (if a test never uses authToken, that login call never happens 
 — no wasted API calls).
Why the async ({ request }, use) => { ...; await use(x); } shape — what is use?
This is Playwright's fixture signature, and it's genuinely unusual if you haven't seen it before. 
use is a callback that:

Takes the value you've built (authApi, bookingApi, token) and hands it to the test.
Pauses the fixture function right there — the code after use() doesn't run until the test finishes.
Resumes after the test, letting you run teardown/cleanup code after await use(x).

We don't need teardown here (no browser to close, no DB connection to release), but this is worth knowing
 conceptually — e.g., if you had a fixture that created a test booking to use across a test, you could 
 await bookingApi.delete(id) after use() to clean it up automatically, every time, without every test 
 remembering to do it.
Why is authToken a separate fixture instead of just calling authApi.createToken() inside a test?
Because tests that don't need auth (like GET /booking/{id}, which is public in restful-booker) 
shouldn't pay the cost of a login call. Playwright fixtures are lazy — they only execute when 
a test destructures them. A GET-only test writes async ({ bookingApi }) => {...} and never 
triggers authApi.createToken() at all. A test that needs to update/delete 
writes async ({ bookingApi, authToken }) => {...} and that's what triggers the login.
This is a real, defensible architecture point: fixtures let each test declare exactly what it depends on, and only that gets built.
Why re-export expect from this file?
So that test files only need one import line: import { test, expect } from '@fixtures/api.fixtures' 
instead of importing test from your fixtures file and expect from @playwright/test separately. 
Small ergonomic choice, but it's the standard convention in every Playwright fixtures file you'll see 
in real codebases.
Why interface ApiFixtures at all — what does the generic <ApiFixtures> do?
It gives you full autocomplete and type-checking in test files. When you later write 
async ({ bookingApi }) => { bookingApi.crea... }, your editor knows bookingApi is a BookingApi 
instance and suggests .create(), .getById(), etc. Without the generic, 
bookingApi would be typed any, silently losing all of this
 */