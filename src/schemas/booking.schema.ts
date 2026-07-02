// This file defines the schema for a booking object using JSON Schema format. The schema specifies the expected structure and data types for a booking, including required properties and their types.
// The schema is used for validating booking data to ensure it adheres to the defined structure before processing or storing it.
export const bookingSchema = {
  type: 'object',
  properties: {
    firstname: { type: 'string' },
    lastname: { type: 'string' },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      properties: {
        checkin: { type: 'string', format: 'date' },
        checkout: { type: 'string', format: 'date' },
      },
      required: ['checkin', 'checkout'],
      additionalProperties: false,
    },
    additionalneeds: { type: 'string' },
  },
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  additionalProperties: false,
} as const; //why as const? This assertion ensures that the TypeScript compiler treats the object as a constant, preserving its literal types and preventing any modifications to its structure or values. It provides stronger type safety when using the schema in TypeScript code.