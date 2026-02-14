module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.redirectUrl = req.session.returnTo;
    }
    next();
};
module.exports.saveReturnTo = (req, res, next) =>{
     console.log(req.query.redirect)
      if(req.query.redirect)
      {
        req.session.returnTo = req.query.redirect
        console.log(req.session.returnTo)
      }
      next()
}