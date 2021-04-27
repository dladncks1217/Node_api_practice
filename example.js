function sum(arr){
    if(arr[0]===undefined) return 0;
    return arr.reduce((acc,item)=>{ // limit 확인용 function
        return acc+=item;
    })
}
function solution(people, limit) {
    var answer = 0;
    let boat = []; // 구출중인사람
    people.sort(); // 몸무게순으로 정렬
    boat.push(people.shift()); // 일단 하나 옮기고
    while(people.length!==0){ // 
        console.log(sum(boat));
        if(sum(boat)<limit){ // 구명보트 초과 확인
            if(sum(boat)+people[0]<limit){ // 더 탈수 있으면
                boat.push(people.shift()); // 구명보트 인원 추가
                continue; // 더 해야하는지 확인
            }else{ // 더 탑승 불가능하면
                answer++; // 카운트+1
                boat = []; // 구명보트 비우기
            }
        }
    }
    
    return answer;
}

console.log(solution([70,50,80,70], 100));