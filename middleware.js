module.exports.saveRedirectUrl = (req, res, next)=>{
    console.log(1);
    console.log(req.session)
    // if(req.session.redirectUrl)
    // {
    //     res.locals.redirectUrl = req.session.redirectUrl;
    //     console.log("locals: ", res.locals.redirectUrl)
    // }
    
    return next();
}