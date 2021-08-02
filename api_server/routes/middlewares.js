const jwt = require('jsonwebtoken');

exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){// 로그인 여부
        next();
    } else{
        res.status(403).send('로그인 필요');
    };
}

exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/');
    }
};
 
exports.verifyToken = (req,res,next)=>{
    try{
        jwt.verify(req.headers.authorization, process.env.JWT_SECRET) // 검증은 jwt.verify로 토큰과 비밀번호 넣어 할 수 있다.
        return next();
    }catch(error){
        if(error.name === "TokenExpiredError"){
            return res.status(419).json({
                code:419,
                message:'토큰이 만료되었습니다.'
            });
        }
        return res.status(401).json({
            code:401,
            message:'유효하지 않은 토큰입니다'
        });
    }
};

// 해커가 토큰을 탈취했을 때, 토큰의 유효기간동안 마음대로 쓰기 가능.
// 이를 막기 위해 유효기간 아주 짧게주고 자주 재발급받는 방법 사용.
// 