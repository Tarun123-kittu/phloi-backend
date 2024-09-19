exports.successResponse = (message = 'success', data = null) => ({
    type: "success",
    message,
    data,

})

exports.errorResponse = (message, code = null) => ({
    type: "error",
    message,
    code
})
