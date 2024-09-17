exports.successResponse = (message = 'success' , data = null) => ({
    type: "success",
    message,
    data
})

exports.errorResponse = (message) => ({
    type: "error",
    message
})
