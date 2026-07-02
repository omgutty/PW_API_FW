//Types first — the contract your code operates on

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface AuthResponse {
  token: string;
}

/**
 * Why separate from the Ajv schema in Step 4: this is a subtle but important distinction to be ready to
 * explain — types.ts is compile-time only; it disappears entirely when TS compiles to JS and has zero 
 * effect at runtime. The Ajv schema is a runtime check against the actual API response. You need both 
 * because TS types only protect your own code (e.g., stop you from typo'ing a field when building
 * a payload) — TS has no way to verify what the live server actually sends back. 
 * Ajv is the one actually looking at real bytes over the wire.
 */