import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

// Create an instance of Ajv with the option to collect all errors
/**
 * Ajv stops at the first validation failure. allErrors: true collects every mismatch in one pass,
 * so if a response has three wrong field types, you see all three in one test failure instead of fixing one,
 * rerunning, finding the next.
 */
const ajv= new Ajv ({allErrors:true});
// Add format validation to the Ajv instance
addFormats(ajv);

export function validateSchema(schema: object, data: unknown): void {
    /**
     * Ajv doesn't interpret the schema on every call; it compiles it into an optimized validator function once.
     * In a framework with many tests reusing the same schema, this matters for speed, 
     * and it's a good "how does Ajv work internally" answer if asked.
     */
    const validate= ajv.compile(schema);
    const isvalid= validate(data);
    if(!isvalid){
        const error =formatErrors(validate.errors);
        throw new Error (`Schema validation failed : \n  ${error}`)
    }
}

/**
 * Custom error formatting — raw Ajv errors are verbose JSON objects.
 * Turning them into a readable bulleted list is what makes a failed test's output actually diagnosable at 2am in CI,
 * instead of you having to console.log and squint at nested objects.
 */

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors) return 'Unknown validation error';
  return errors
    .map((e) => `  • ${e.instancePath || '(root)'} ${e.message}`)
    .join('\n');
}