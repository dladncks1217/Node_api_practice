// API서버는 버전 관리가 중요. 
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');

const {verifyToken, apiLimiter} = require('./middlewares');
const {Domain, User, Post, Hashtag} = require('../models');
const router = express.Router();

//router.use(cors('localhost:8002')); // 얘가 응답헤더에 Access-Control-Allow-Origin 넣어줌.
router.use(async(req,res,next)=>{
    const domain = await Domain.findOne({ // 도메인이 있는지 검사.
        where: {host:url.parse(req.get('origin')).host},
    });
    if(domain){
        cors({origin:req.get('origin')})(req,res,next);
    }else{
        next();
    }
    
}) // 위와 똑같고, 이를 이용해 커스터마이징 가능.
router.post('/token',apiLimiter, async(req,res)=>{ // 토큰 발급해줄 라우터
    const {clientSecret} = req.body; // 사용자가 비밀 키 넣어주면 발급
    try{
        const domain = await Domain.findOne({ // clientSecret이 맞는지 확인
            where:{clientSecret},
            include:{
                model:User,
                attribute:['nick','id']
            }
        });
        if(!domain){
            return res.status(401).json({
                code:401,
                message:'등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.'
            });
        }
        const token = jwt.sign({ // jwt.sign으로 토큰 발급가능.(clientSecret이 맞는경우)
            id:domain.user.id,
            nick:domain.user.nick  // jwt.sign(아이디, jwt시크릿키, 유효기간)
        },process.env.JWT_SECRET,{
            expiresIn:'1m', // 토큰 유효시간
            issuer:'nodebird'
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다.',
            token,
        });
    }catch(error){ // catch할때 next error안하고 json하는 이유: 응답을 json으로 통일하기 위함.
        return res.status(500).json({ 
            code:500,
            messgae:'서버 에러',
        })
    }
});

router.get('/test', apiLimiter, verifyToken, (req,res)=>{
    console.log(req.authorization);
    res.json(req.decoded);
});

router.get('/posts/my', apiLimiter, verifyToken,(req,res)=>{
    Post.findAll({where:{userId:req.decoded.id}})
    .then((posts)=>{
        console.log(posts);
        res.json({
            code:200,
            payload: posts,
        });
    })
    .catch((error)=>{
        console.error(error);
        return res.status(500).json({
            code:500,
            message:'서버 에러',
        });
    })
});

router.get('/posts/hashtag/:title', apiLimiter, verifyToken, async(req,res)=>{
    try{
        const hashtag = await Hashtag.findOne({where:{title:req.params.title}});
        if(!hashtag){
            return res.status(404).json({
                code:404,
                message:'검색 결과가 없습니다.',
            })
        }
        const posts = await hashtag.getPosts();
        return res.json({
            code:200,
            payload: posts,
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code:500,
            message:'서버 에러',
        })
    }
});

router.get('/follow', apiLimiter, verifyToken,async(req,res)=>{
    try{
        const user = await User.findOne({where:{id:req.decoded.id}});
        const follower = await user.getFollowers({ attributes:['id','nick']});
        const following = await user.getFollowings({ attributes:['id','nick']});
        return res.json({
            code:200,
            follower,
            following,
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code:500,
            message:'서버 에러'
        })
    }
})

module.exports = router;
