
const decision = (game)=>{
    // horizontal
    if(game[0]===game[1] && game[1]===game[2]){
        if(game[0]==='x') return ['x',[0,1,2]];
        else return ['o',[0,1,2]];
    }
    if(game[3]===game[4] && game[4]===game[5]){
        if(game[3]==='x') return ['x',[3,4,5]];
        else return ['o',[3,4,5]];
    }
    if(game[6]===game[7] && game[7]===game[8]){
        if(game[6]==='x') return ['x',[6,7,8]];
        else return ['o',[6,7,8]];
    }

    // vertical
    if(game[0]===game[3] && game[3]===game[6]){
        if(game[0]==='x') return ['x',[0,3,6]];
        else return ['o',[0,3,6]];
    }
    if(game[1]===game[4] && game[4]===game[7]){
        if(game[1]==='x') return ['x',[1,4,7]];
        else return ['o',[1,4,7]];
    }
    if(game[2]===game[5] && game[5]===game[8]){
        if(game[2]==='x') return ['x',[2,5,8]];
        else return ['o',[2,5,8]];
    }

    // diagonal
    if(game[0]===game[4] && game[4]===game[8]){
        if(game[0]==='x') return ['x',[0,4,8]];
        else return ['o',[0,4,8]];
    }
    if(game[2]===game[4] && game[4]===game[6]){
        if(game[2]==='x') return ['x',[2,4,6]];
        else return ['o',[2,4,6]];
    }

    for(let i of game){
        if(Number.isInteger(i)) return ['pending'];
    }

    return ['draw'];
}

export default decision;