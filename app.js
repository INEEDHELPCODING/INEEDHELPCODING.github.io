class Entity {
    constructor(statMedian, statMD) {
        // statMD = stat maximum deviation

        this.stats = [];
        // Note: stats array length 10.

        for (let i=1; i<11; i++) {
            let value = randRange(statMedian - statMD, statMedian + statMD);
            if (value < 0) {
                value = 0;
            }

            this.stats.push(value);
        }
    }
}


// Hardcoded class lol, only used for one purpose and one only: to shuffle colours while making sure all are chosen before a new cycle (like spotify).
// Daniel would hate me using a class for this but like it's neater.
class ColourSelector {
    constructor() {
        this.colours = [  // Colours subject to change.
            "#db3535",  // Red
            "#0683cc",  // Blue
            "#64d111",  // Green
            "#ebcc1c",  // Yellow
        ]

        this.alreadySelected = []
    }

    choose() {
        let num = Math.floor(Math.random() * this.colours.length)  // Remember this is exclusive of this.colours.length(), this is fine because value is used to search array.
        while (this.alreadySelected.includes(num)) {
            num = Math.floor(Math.random() * this.colours.length)
        }
        this.alreadySelected.push(num)

        if (this.alreadySelected.length == this.colours.length) {
            this.alreadySelected = []
        }

        return this.colours[num]
    }
}


class Timer {
    constructor(seconds) {
        this.timeElapsed = 0;
        this.timerExpired = false;
        
        let count = seconds;

        this.timer = setInterval(() => {
            const target = document.getElementById("timer");
            
            if (count < 0) {
                this.timerExpired = true
                target.innerHTML = `Seconds Overtime: ${-count}`;
            } else {
                target.innerHTML = `Seconds Left: ${count}`;
            }
            count--;
            this.timeElapsed++;

        }, 1000);
    }

    stop() {
        clearInterval(this.timer)
    }
}


class GameRound {
    static randomColour = new ColourSelector();
    
    
    constructor(statMedian, statMD) {
        this.statMedian = statMedian;
        this.statMD = statMD;  // stat maximum deviation
        this.roundEnemy;
        this.roundCharacters = [];


        // Determine colour and apply it.
        this.bgColour = GameRound.randomColour.choose();
        document.body.style.backgroundColor = this.bgColour


        // Create Enemy
        this.roundEnemy = new Entity(this.statMedian, this.statMD)
        for (let i=0; i<10; i++) {  // Loop for stats
            let target = document.getElementById(`enemy-stat${i+1}`);
            target.innerHTML = `Stat ${i+1}: ${this.roundEnemy.stats[i]}`;
        }


        // Create Characters
        for (let n=0; n<10; n++) {
            this.roundCharacters.push(new Entity(this.statMedian, this.statMD))

            for (let i=0; i<10; i++) {  // Loop for stats
                let target = document.getElementById(`char${n+1}-stat${i+1}`);
                target.innerHTML = `Stat ${i+1}: ${this.roundCharacters[n].stats[i]}`;
            }
        }      
    }  
}


// Game Round stuff
let totalRounds = 5;  // Very much subject to change

// Minus one because actual time is 1 second longer than specified.
let intermissionTime = 2;
let roundTime = 10;
intermissionTime--;
roundTime--;

let roundNumber = 1;
let gameInfo = [];
let currentRound = new GameRound(10, 10);  // Note to self; stat median and MD will vary as game progresses.
let timer = new Timer(roundTime)


// Actions upon form submit
const form = document.getElementById("player-options");
form.addEventListener("submit", (event) => {
    event.preventDefault();  // Don't reload webpage grr
    if (timer.timerExpired == true) {console.log("time expired");}

    // Code taken off the internet idk how it works lol
    const data = new FormData(form);
    let output;
    let choice;
    for (const entry of data) {
        output = `${entry[0]}=${entry[1]}\r`;
        choice = entry[1];
    }

    console.log(`Chosen option ${choice}`);
    const radio = document.getElementById(`choice${choice}`);
    radio.checked = false;

    
    // Save round data.
    let roundInfo = {
        entityStat_Median_SD: [currentRound.statMedian, currentRound.statMD],
        roundNumber: roundNumber,
        choiceNumber: choice,
        enemy: currentRound.roundEnemy,
        character: currentRound.roundCharacters[choice-1],
        timeExpired: timer.timerExpired,
        timeElapsed: timer.timeElapsed,
        backgroundColour: currentRound.bgColour
    };
    gameInfo.push(roundInfo);
    
    // End round and proceed.
    if (roundNumber == totalRounds) {
        timer.stop()
        document.body.style.backgroundColor = "white"

        let targets = ["player-options", "enemy-info"]
        let target;

        for (const item of targets) {  // "for ... of ..." is used for the value of objects being iterated. "for ... in ..." is used for the keys (index in arrays).
            target = document.getElementById(item);
            target.hidden = true
        }

        target = document.getElementById("timer");
        target.innerHTML = "Game concluded."

        console.log("game finish")
        console.log(gameInfo);

    } else {
        // Round intermission
        count = intermissionTime;

        let targets = ["player-options", "enemy-info", "timer", "user-interface"]
        let target;
        for (const item of targets) {  // "for ... of ..." is used for the value of objects being iterated. "for ... in ..." is used for the keys (index in arrays).
            target = document.getElementById(item);
            target.hidden = true
        }
        document.body.style.backgroundColor = "white"

        intermissionTimer = setInterval(() => {
            if (count < 0) {
                clearInterval(intermissionTimer)

                for (const item of targets) {  // "for ... of ..." is used for the value of objects being iterated. "for ... in ..." is used for the keys (index in arrays).
                    target = document.getElementById(item);
                    target.hidden = false
                }

                // New round. All data from previous round is deleted (except data stored in gameInfo)
                roundNumber++;
                currentRound = new GameRound(10, 10);

                timer.stop()
                timer = new Timer(roundTime);
            }
            count--;
        }, 1000);
    };
});



// tools

function randRange(min, max) {  // Min inclusive, Max exclusive
    return Math.floor((Math.random() * (max - min)) + min);
}

function arraySum(array) {
    return array.reduce((total, current) => {
        return total += current;
    }, 0);
}