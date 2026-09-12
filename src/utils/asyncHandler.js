

const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
}



export {asyncHandler}






// "asyncHandler is a function that receives another function as an argument."
// const asyncHandler = () =>{}
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (fn) => async() => {}

// This is try catch method to handle async errors in express js .. 

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)      
//     } catch (error) {
//        res.status(err.code || 500).json({
//         success: false,
//         message: error.message
//        })
//     }
// }