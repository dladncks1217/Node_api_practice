const express = require('express');
const { v4: uuidv4 } = require('uuid'); uuidv4();
const router = express.Router();
const {User,Domain} = require('../models');

router.get('/',(req,res,next)=>{
    User.findOne({
        where:{id:req.user && req.user.id||null},
        include:{model:Domain},
    })
    .then((user)=>{
       res.render('login',{
            user,
            loginError: req.flash('loginError'),
            domains : user&&user.domains,
       })
    })
    .catch((error)=>{
        console.error(error);
        next(error);
    })
});

router.post('/domain',(req,res,next)=>{
    Domain.create({
        userId: req.user.id,
        host: req.body.host,
        type: req.body.type,
        clientSecret: uuidv4(), // 서버 요청 시 검사
    })
    .then(()=>{
        res.redirect('/');
    })
    .catch((error)=>{
        console.error(error);
        next(error);
    })
});

module.exports = router;