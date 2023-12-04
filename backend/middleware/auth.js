const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, "nv87UGE8aTbuOYrmdYgGKujyKq3AtgIDPPuC7uHl");
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
    
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};