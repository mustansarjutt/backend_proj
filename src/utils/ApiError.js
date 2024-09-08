class ApiError extends Error {
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack="" 
    ) {
        super(message)
        this.statusCode = statusCode
        // what is this.data?
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.costructor)
        }
    }
}

export {ApiError}