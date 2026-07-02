//AuthApi — small, but demonstrates the pattern cleanly
/**
 * Why a class, and why private request in the constructor: this is TypeScript's parameter property 
 * shorthand — constructor(private request: APIRequestContext) both declares and assigns the class
 * field in one line, equivalent to writing this.request = request explicitly.
 * The request object (Playwright's APIRequestContext) is injected rather than
 * created inside the class — that's dependency injection: the service object doesn't know
 * or care whether request came from a real Playwright fixture or a test double, 
 * which makes it possible to point the same AuthApi class at different environments/contexts without
 * changing its code.
 */

