module.exports = (sequelize,DataTypes)=>(
    sequelize.define('domain',{
        host:{ // 사용자가 api를 쓸 수 있는 도메인을 제한.
            type:DataTypes.STRING(80),
            allowNull:false,
        },
        type:{// 유료사용자 무료사용자 구분 (유료는 더 다양한 api)
            type:DataTypes.STRING(10),
            allowNull:false,
        },
        clientSecret:{ // 비밀 키
            type:DataTypes.STRING(40),
            allowNull:false,
        },
    },{
        timestamps:true, // 생성, 수정시간
        paranoid:true, // 삭제일
        validate:{ // 데이터들이 올바르게 들어왔나 추가적으로 검사.
            unknownType(){
                if(this.type !== 'free'&& this.type !== 'premium'){// free랑 premium은 우리가 걍 만든거임
                    throw new Error('type 컬럼은 free이거나 premium이여야 합니다.')
                }
            }
        },
    })
);