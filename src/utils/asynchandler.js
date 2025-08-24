const asynchandler = (requesthandeler)=>{
   return (req,res,next)=>{
        Promise.resolve(requesthandeler(req,res,next)).catch((err)=>next(err))
    }


}


export {asynchandler};


//This is a exaple of higher order function
//A higher order function is a function that either takes one or more functions as arguments, or
//returns a function as its result.
//or do both
// const asynchandler =()=>{}
// const asynchandler =(fun)=>{()=>{}}
// const asynchandler =(fun)=>()=>{}
// const asynchandler =(fun)=>async()=>{}












// const asynchandler =(fun)=> async(req,res,next)=>{
//     try{

//         await fun(req,res,next);
//     }catch(err){
//         res.status(err.code||500).json({
//             success:false,
//             menubare:err.message
//         })
//     }
// }