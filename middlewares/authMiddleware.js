const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if(!authHeader){
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try{
    decodedToken = jwt.verify(authHeader, process.env.JWT_SECRET_KEY);
  }catch(err){
    req.isAuth = false;
    return next();
  }

  if(!decodedToken){
    req.isAuth = false;
    return next();
  }
  
  req.isAuth = true;
  req.userId = decodedToken.uid;
  next();
}