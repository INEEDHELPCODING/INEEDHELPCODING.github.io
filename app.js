class Entity {
    // statMD means stat maximum deviation
    constructor(statMedian, statMD, modifier) {
        // Note: there will be 10 stats in the array
        this.stats = [];
        for (let i = 1; i < 11; i++) {
            let value = randRange(statMedian - statMD, statMedian + statMD);
            if (value < 0) {
                value = 0;
            }

            this.stats.push(value);
        }

        this.statTotal = 0;
        for (let i = 0; i < 10; i++) {
            this.statTotal += modifier[i] * this.stats[i]
        }

        this.rank;
    }
}


// Hardcoded class lol, only used for one purpose and one only: to shuffle colours while making sure all are chosen before a new cycle (like spotify).
class ColourSelector {
    static colours = [  // Colours subject to change.
        "#e92828ff",  // Red
        "#2551e4ff",  // Blue
        "#24f011ff",  // Green
        "#ffda08ff",  // Yellow
        "#f531b4ff",  // Magenta
        "#09e7f7ff",  // Cyan
    ];

    static availableColours = this.colours.slice();

    static choose() {
        // Choose random colour from available colours
        const i = Math.floor(Math.random() * this.availableColours.length);
        const colour = this.availableColours[i];
        // Remove selected colour to guarantee every colour gets selected evenly
        this.availableColours.splice(i, 1);

        if (this.availableColours.length == 0) {
            this.availableColours = this.colours.slice();
        }

        return colour;
    }
}


class Timer {
    constructor(seconds) {
        this.timeElapsed = 0;
        this.timerExpired = false;

        let count = seconds;

        this.timer = setInterval(() => {
            const target = document.getElementById("timer");

            if (count <= 0) {
                this.timerExpired = true;
                target.innerHTML = `Seconds Overtime: ${-count}`;
            } else {
                target.innerHTML = `Seconds Left: ${count}`;
            }
            count--;
            this.timeElapsed++;
        }, 1000);
    }

    stop() {
        clearInterval(this.timer);
    }
}


class GameRound {
    constructor(statMD, statMedian , chooseColour) {
        this.statMedian = statMedian;
        this.statMD = statMD;  // stat maximum deviation
        this.roundEnemy;
        this.roundCharacters = [];

        // Helpful tool
        const statToName = {
            1: "Strength",
            2: "Speed",
            3: "Intelligence",
            4: "Perserverence",
            5: "Luck",
            6: "Rizz",
            7: "Cuteness",
            8: "Moolah",
            9: "Mana",
            10: "Competence"
        } 


        // Determine colour and apply it.
        if (chooseColour) {
            this.bgColour = ColourSelector.choose();
            document.body.style.backgroundColor = this.bgColour;
        }

        // Determine modifiers
        this.modifier = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        this.modifierCount = randRange(0, 5);

        let selectedIndex = [];  // Make sure no repeats

        for (let i = 0; i < this.modifierCount; i++) {
            let index = randRange(0, 10);
            while (selectedIndex.includes(index)) {
                index = randRange(0, 10);
            }
            selectedIndex.push(index);

            // console.log(selectedIndex)

            const value = randRange(1, 5) / 2  // Modifier can be 1 to 2.
            this.modifier[index] = value  

            if (value != 1) document.getElementById("rules").innerHTML += `<br>${statToName[index + 1]} has ${value}x value.`
        }


        // Create Enemy
        this.roundEnemy = new Entity(this.statMedian, this.statMD, this.modifier);
        for (let i = 0; i < 10; i++) {  // Loop for stats
            let target = document.getElementById(`enemy-stat${i + 1}`);
            target.innerHTML = `${statToName[i + 1]}: ${this.roundEnemy.stats[i]}`;
        }


        // Create Characters
        for (let n = 0; n < 10; n++) {
            this.roundCharacters.push(new Entity(this.statMedian, this.statMD, this.modifier));

            for (let i = 0; i < 10; i++) {  // Loop for stats
                let target = document.getElementById(`char${n+1}-stat${i + 1}`);
                target.innerHTML = `${statToName[i + 1]}: ${this.roundCharacters[n].stats[i]}`;
            }
        }
    }
}


// Game Round stuff
const totalRounds = 16;  // Very much subject to change

// Minus one because actual time is 1 second longer than specified due to how setInterval works. Always has interval of minimum 1 seconds.
const intermissionTime = 6 - 1;
const roundTime = 45 - 1;
const pointScale = 10;
const roundMD = 10  // Stat maximum deviation from roundMedian
const roundMedian = 15
const roundVariation = 5  // The number the roundMedian may deviate by a maximum of.
const encryptionKey = 13;


let roundNumber = 1;
let gameInfo = [];
let currentRound = new GameRound(roundMD, roundMedian, false);
let timer = new Timer(roundTime);
let points = 100;

document.getElementById("copy-code").hidden = true


// Actions upon form submit
const form = document.getElementById("player-options");
form.addEventListener("submit", event => {
    event.preventDefault();  // Don't reload webpage grr
    // if (timer.timerExpired) console.log("time expired");

    // Code taken off the internet idk how it works lol
    const data = new FormData(form);
    let choice;
    for (const entry of data) {
        // console.log(`for loop entry: ${entry}`)
        choice = entry[1];
    }

    // console.log(`Chosen option ${choice}`);
    const radio = document.getElementById(`choice${choice}`);
    radio.checked = false;

    
    // Process quality of player choice
    // Currently only working on just sum. Add special conditions / multipliers later.
    const enemy = currentRound.roundEnemy;
    const playerChoice = currentRound.roundCharacters[choice - 1];

    let winEnemy = [];
    let loseEnemy = [];
    for (const entity of currentRound.roundCharacters) {
        if (entity.statTotal >= enemy.statTotal) {  // >= means they will win even if they are equal with enemy.
            winEnemy.push(entity);
        } else {
            loseEnemy.push(entity);
        }
    }

    let choiceCategory;
    if (winEnemy.includes(playerChoice)) {
        choiceCategory = winEnemy;
    } else if (loseEnemy.includes(playerChoice)) {
        choiceCategory = loseEnemy;
    } else {
        // console.log("Point calculation broken.")
    }

    switch (choiceCategory) {
        case winEnemy:
            choiceCategory = "win";
            break;

        case loseEnemy:
            choiceCategory = "lose"
            break;
    }

    // Adjust points
    // Point system works like this: total stats are sorted by descending order, the highest total stat is rank 1. 
    // They gain ponints for higher ranks. If the enemy defeats all, then choose the best option to minimise point loss.
    choicesList = currentRound.roundCharacters.slice();
    let criticalRank = 10;

    // Sort
    for (let i = 0; i < choicesList.length; i++) {
        for (let n = 0; n < choicesList.length - 1; n++) {
            if (n < choicesList.length - 1) {
                let leftValue = choicesList[n];
                let rightValue = choicesList[n+1];

                if (leftValue.statTotal < rightValue.statTotal) {
                    choicesList[n] = rightValue
                    choicesList[n+1] = leftValue
                }
            }
        }
    }

    for (const n in choicesList) {
        let character = choicesList[n];
        character.rank = Number(n) + 1

        if (character.statTotal <= enemy.statTotal) {
            let newCriticalRank = character.rank;
            if (newCriticalRank < criticalRank) {
                criticalRank = newCriticalRank
            }
        }
    }

    pointChange = (criticalRank - playerChoice.rank) * pointScale;
    if (timer.timeElapsed > roundTime + 1) pointChange - 50;

    points += pointChange;
    document.getElementById('points').innerHTML = `Points: ${points}`;


    // Process standard deviation of options to assess difficulty.
    let sample = [];
    for (const n of choicesList) {
        sample.push(n.statTotal);
    }
    let mean = Math.floor(arraySum(sample) / sample.length * 100) / 100;
    let sum = 0;
    for (const n of sample) {
        sum += (n - mean) ** 2;
    }

    let sd = Math.floor(Math.sqrt(sum / sample.length) * 100) / 100;


    // Save round data.
    let roundInfo = {
        median_MD: [currentRound.statMedian, currentRound.statMD],
        roundNumber: roundNumber,
        choiceNumber: choice,
        // enemy: enemy,
        // character: playerChoice,
        // timeExpired: timer.timerExpired,
        timeElapsed: timer.timeElapsed,
        bgColour: currentRound.bgColour,
        // result: choiceCategory,
        // points: points,
        pointChange: pointChange,
        standardDeviation: sd,
        // allEntities: currentRound.roundCharacters,
        // modifier: currentRound.modifier,
        modifierCount: currentRound.modifierCount,
        rank_critRank: [playerChoice.rank, criticalRank],
    };
    gameInfo.push(roundInfo);
    // console.log(gameInfo);


    // End round and proceed.
    if (roundNumber == totalRounds) {

        // Game end
        timer.stop();
        document.body.style.backgroundColor = "white";
        document.getElementById("game").hidden = true;

        let string = encryptMessage(JSON.stringify(gameInfo), encryptionKey);
        
        let target = document.getElementById("display");
        target.innerHTML = `<h1>Game concluded. You have ${points} points.</h1>`;

        document.getElementById("game-code").innerHTML = string;
        document.getElementById("copy-code").hidden = false;  // Enable users to see element to copy code.

        // console.log("game finish");
        // console.log(gameInfo);



    } else {
        // Round intermission
        count = intermissionTime;

        document.getElementById("game").hidden = true;
        document.body.style.backgroundColor = "white";
        document.getElementById("display").innerHTML = `<h1>Intermission...</h1>`;

        intermissionTimer = setInterval(() => {
            if (count <= 0) {
                clearInterval(intermissionTimer);

                document.getElementById("game").hidden = false;
                document.getElementById("display").innerHTML = `<h1>Battle!</h1>`;
                document.getElementById("rules").innerHTML = `Modifiers:`;

                // New round. All data from previous round is deleted (except data stored in gameInfo)
                roundNumber++;
                // White rounds for first two and last two, to help judge decision fatigue.
                if (roundNumber == 1 || roundNumber == 2 || roundNumber == totalRounds - 1 || roundNumber == totalRounds) {  
                    currentRound = new GameRound(roundMedian, roundMD, false);

                } else {
                    currentRound = new GameRound(roundMedian + randRange(-roundVariation, roundVariation), roundMD + randRange(-roundVariation, roundVariation), true);
                }

                timer.stop();
                timer = new Timer(roundTime);
                
            }
            count--;
        }, 1000);
    }
});



// tools
function encryptMessage(string, key) {
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    let encrypted = '';

    for (const n in string) {
        const letter = string[n];

        if (alphabet.includes(letter)) {
            let index = alphabet.findIndex((item) => {
                return item == letter;
            });

            encrypted += alphabet[(index + key) % alphabet.length]
        } else if (letter == ':') {
            encrypted += '%';
        } else {
            encrypted += letter;
        }
    }

    return encrypted;
}

function decryptMessage(string, key) {
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    let decrypted = '';

    for (const n in string) {
        const letter = string[n];

        if (alphabet.includes(letter)) {
            let index = alphabet.findIndex((item) => {
                return item == letter;
            });

            decrypted += alphabet[(index + (alphabet.length - key)) % alphabet.length]
        } else if (letter == '%') {
            decrypted += ':';
        } else {
            decrypted += letter;
        }
    }

    return decrypted;
}

// console.log(encryptMessage('[{"median_MD":[10,10],"roundNumber":1,"choiceNumber":"1","timeElapsed":7,"bgColour":"#ebcc1c","result":"lose","standardDeviation":15.39,"modifierCount":0,"rank_critRank":[9,7]},{"median_MD":[10,10],"roundNumber":2,"choiceNumber":"1","timeElapsed":1,"bgColour":"#0683cc","result":"lose","standardDeviation":14.98,"modifierCount":0,"rank_critRank":[7,3]}]', 10))
// console.log(decryptMessage('[{"xonsky_MD"%[aj,aj],"3z6ynN6xlo3"%a,"mrzsmoN6xlo3"%"a","5sxoEvk14on"%g,"lqCzvz63"%"#olmmam","3o46v5"%"vz4o","45kynk3nDo7sk5szy"%ae.ci,"xznspso3Cz6y5"%j,"3kyu_m3s5Rkyu"%[i,g]},{"xonsky_MD"%[aj,aj],"3z6ynN6xlo3"%b,"mrzsmoN6xlo3"%"a","5sxoEvk14on"%a,"lqCzvz63"%"#jfhcmm","3o46v5"%"vz4o","45kynk3nDo7sk5szy"%ad.ih,"xznspso3Cz6y5"%j,"3kyu_m3s5Rkyu"%[g,c]}]', 10))

function randRange(min, max) {  // min inclusive, max exclusive
    return Math.floor((Math.random() * (max - min)) + min);
}

function arraySum(array) {
    return array.reduce((total, current) => {
        return total += current;
    }, 0);
}
