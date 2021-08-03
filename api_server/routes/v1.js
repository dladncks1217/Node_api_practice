const express = require('express');
const jwt = require('jsonwebtoken');

const {verifyToken} = require('./middlewares');
const {Domain, User, Post, Hashtag} = require('../models');
const { default: jwtDecode } = require('jwt-decode');

const router = express.Router();

router.post('/token',async(req,res)=>{ // 토큰 발급해줄 라우터
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

router.get('/test', verifyToken, (req,res)=>{
    console.log(req.authorization);
    res.json(req.decoded);
});

router.get('/posts/my',verifyToken,(req,res)=>{
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

router.get('/posts/hashtag/:title',verifyToken, async(req,res)=>{
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

router.get('/follow',verifyToken,async(req,res)=>{
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




// jwt 토큰내용 다 보임. 민감한 내용 저장 안하는게 좋음, 대신 변조가 절때 불가능 -> 믿고 사용 가능