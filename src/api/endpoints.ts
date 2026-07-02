//Centralize endpoint paths

export const endpoints = {
    auth: '/auth',
    booking: '/booking',
    bookingById: (id: number) => `/booking/${id}`,
} as const;
/**
 * Why a function for bookingById: paths with dynamic segments (an ID) are still centralized in one place
 * — if restful-booker ever changed its routing convention (e.g. /booking/{id} → /bookings/{id}/details), 
 * you'd fix it in exactly one line, not hunt through every test.
 */