class Entity {
    constructor(statMedian, statSD) {
        // statSD = stat standard deviation

        this.stats = [];
        // Note: stats array length 10.

        for (let i=1; i<11; i++) {
            let value = randRange(statMedian - statSD, statMedian + statSD);
            if (value < 0) {
                value = 0;
            }

            this.stats.push(value);
        }
    }
}

class GameRound {
    constructor(statMedian, statSD) {
        this.statMedian = statMedian;
        this.statSD = statSD;  // stat standard deviation
        this.roundEnemy;
        this.roundCharacters = [];
        this.results;


        // Create Enemy
        this.roundEnemy = new Entity(this.statMedian, this.statSD)
        for (let i=0; i<10; i++) {  // Loop for stats
            let target = document.getElementById(`enemy-stat${i+1}`);
            target.innerHTML = `Stat ${i+1}: ${this.roundEnemy.stats[i]}`;
        }


        // Create Characters
        for (let n=0; n<10; n++) {
            this.roundCharacters.push(new Entity(this.statMedian, this.statSD))

            for (let i=0; i<10; i++) {  // Loop for stats
                let target = document.getElementById(`char${n+1}-stat${i+1}`);
                target.innerHTML = `Stat ${i+1}: ${this.roundCharacters[n].stats[i]}`;
            }
        }      
    }  
}


// Form submit handling
const form = document.getElementById("player-options");
let roundNumber = 1;
let currentRound = new GameRound(10, 10);
let gameInfo = [];

form.addEventListener("submit", (event) => {
        event.preventDefault();  // Don't reload webpage grr

        // Code taken off the internet idk how it works lol
        const data = new FormData(form)
        let output;
        let choice;
        for (const entry of data) {
            output = `${entry[0]}=${entry[1]}\r`;
            choice = entry[1];
        }

        console.log(`Chosen option ${choice}`)
    
        
        // Put round submission handling logic below
        let roundInfo = {
            roundNumber: roundNumber,
            choiceNumber: choice,
            enemy: currentRound.roundEnemy,
            character: currentRound.roundCharacters[choice-1]
        };
        gameInfo.push(roundInfo);

        console.log(gameInfo);
        

        // Very important to place at bottom, as all data from previous round is deleted (except data stored in gameInfo)
        roundNumber++;
        currentRound = new GameRound(10, 10);
    }
)



// tools

function randRange(min, max) {  // Min inclusive, Max exclusive
    return Math.floor((Math.random() * (max - min)) + min);
}

function arraySum(array) {
    return array.reduce((total, current) => {
        return total += current;
    }, 0);
}