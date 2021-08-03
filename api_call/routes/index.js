const express = require('express');
const axios = require('axios'); // axios.메서드(주소, 옵션)   다른 서버에 요청 보내는 라이브러리
const { request } = require('express');
const router = express.Router();

router.get('/test', async(req,res,next)=>{
    try{
        if(!req.session.jwt){ // 한 번 토큰 받아오면 유효기간 끝나기 전까지는 세션에 저장해둘거임.
            const tokenResult = await axios.post('http://localhost:8002/v1/token',{
                clientSecret:process.env.CLIENT_SECRET,
            });
            if(tokenResult.data && tokenResult.data.code===200){ // 토큰 발급 성공 시
                req.session.jwt = tokenResult.data.token;
            }else{ // 토큰 발급 실패 시
                return res.json(tokenResult.data); // 이 데이터에 에러 들어있음.
            }
        }
        console.log("이거임"+req.session.jwt);
        const result = await axios.get('http://localhost:8002/v1/test',{
            headers:{ authorization: req.session.jwt },
        });
        return res.json(result.data);
    }catch(error){
        console.error(error);
        if(error.response.status===419){ // 토큰 만료 에러
            return res.json(error.response.data);
        }
        return next(error);
    }
});

const requests = async(req,api)=>{
    try{
        if(!req.session.jwt){
            const tokenResult = await axios.post('http://localhost:8002/v1/token',{
                clientSecret:process.env.CLIENT_SECRET,
            });
            req.session.jwt = tokenResult.data.token;
        }
        return await axios.get(`http://localhost:8002/v1${api}`,{
            headers:{authorization:req.session.jwt},
        });
    }catch(error){
        console.error(error);
        if(error.response.status < 500){
            return error.response;
        }
        throw error;
    }
};

// /mypost ---> api_server의 /posts/my로 요청
router.get('/mypost',async (req,res,next)=>{
    try{
        const result = await requests(req,'/posts/my');
        res.json(result.data);
    }catch(error){
        console.error(error);
        next(error);
    }
})

// /search/'노드' ---> api_server의 /posts/hashtag/'노드' 요청
router.get('/search/:hashtag', async (req,res,next)=>{
    try{
        const result = await requests(
            req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`, // encodeURIComponent쓴 이유 : 주소 한글썼을때 오류 막으려고
        );
        res.json(result.data);
    }catch(error){
        console.error(error);
        next(error);
    }
})

router.get('/follow', async(req,res,next)=>{
    try{
        const result = await requests(req,'/follow');
        res.json(result.data);
    }catch(error){
        console.log(error);
        next(error);
    }
})

module.exports = router;


// 재발급부분, 내 게시글가져오기, 해시태그검색