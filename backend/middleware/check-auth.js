const jwt= require("jsonwebtoken");


module.exports =(req,res, next)=>{
    try {
     
        const token= req.headers.authorization.split(" ")[1];
        //Verifico el token, lo decodifico y lo anado en request como userData
        const decodedToken= jwt.verify(token, "InclUir_luEgo_cLav3_s3cr3ta_más_l@rg@" );
        req.userData ={email: decodedToken.email, userId: decodedToken.userId};
        next();
    } catch( error){
        res.status(401).json({ message: "You are not authenticated, please login again"});
    }
    

};