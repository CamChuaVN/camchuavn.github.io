const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', (event) => {
    sendMessage('token ' + getCookie('token'));
});

socket.addEventListener('message', (event) => {
    let message = event.data;
    let argument = message.toString().split(' ');
    let type = argument[0];
    switch(type.toLowerCase()) {
        case 'remaining': {
            let remaining = argument[1];
            let remainingTime = document.getElementById('remainingTime');
            remainingTime.innerText = ' 00:' + remaining.padStart(2, '0');
            break;
        }
        case 'pool': {
            let poolStr = argument[1];
            let pool = poolStr.split('|');
            pool.forEach((item, index) => {
                let bet = item.split(',');
                bet.forEach((value, index2) => {
                    let element = document.getElementById('p' + (index2 + 1) + '_' + (index + 1));
                    element.innerText = index === 1 ? value : (value / 1000) + 'k';
                });
            });
            let userPlaying = document.getElementById('userPlaying');
            userPlaying.innerText = argument[2];
            break;
        }
        case 'result': {
            let result = argument[1];
            let balance = parseInt(argument[2]);
            displayResult(result.split(','), parseInt(argument[3]));
            if(balance > -1) {
                setTimeout(function() {
                    let userBalance = document.getElementById('userBalance');
                    userBalance.innerText = (parseInt(balance) / 1000) + 'k';
                }, 4000);
            }
            break;
        }
        case 'balance': {
            let balance = argument[1];
            let userBalance = document.getElementById('userBalance');
            userBalance.innerText = (parseInt(balance) / 1000) + 'k';
            break;
        }
        case 'failed': {
            console.log(message);
            let messageId = argument[1];
            swal(language['failedLabel'], language[messageId], 'error');
            break;
        }
        default: {
            console.log(message);
            break;
        }
    }
});

socket.addEventListener('close', (event) => {
    
});

function sendMessage(message) {
    socket.send(message);
}


let chosenType = 0;
document.getElementById('deerBet').addEventListener('click', function() {
    chosenType = 1;
    let placeBetLabel = document.getElementById('placeBetLabel');
    placeBetLabel.innerText = language['game_HooHeyHow_Betting_Label'] + ' ' + language['game_HooHeyHow_Deer'];

    let placeBet = document.getElementById('placeBet');
    placeBet.style.display = 'flex';
});
document.getElementById('gourdBet').addEventListener('click', function() {
    chosenType = 2;
    let placeBetLabel = document.getElementById('placeBetLabel');
    placeBetLabel.innerText = language['game_HooHeyHow_Betting_Label'] + ' ' + language['game_HooHeyHow_Gourd'];

    let placeBet = document.getElementById('placeBet');
    placeBet.style.display = 'flex';
});
document.getElementById('chickenBet').addEventListener('click', function() {
    chosenType = 3;
    let placeBetLabel = document.getElementById('placeBetLabel');
    placeBetLabel.innerText = language['game_HooHeyHow_Betting_Label'] + ' ' + language['game_HooHeyHow_Chicken'];

    let placeBet = document.getElementById('placeBet');
    placeBet.style.display = 'flex';
});
document.getElementById('fishBet').addEventListener('click', function() {
    chosenType = 4;
    let placeBetLabel = document.getElementById('placeBetLabel');
    placeBetLabel.innerText = language['game_HooHeyHow_Betting_Label'] + ' ' + language['game_HooHeyHow_Fish'];

    let placeBet = document.getElementById('placeBet');
    placeBet.style.display = 'flex';
});
document.getElementById('crabBet').addEventListener('click', function() {
    chosenType = 5;
    let placeBetLabel = document.getElementById('placeBetLabel');
    placeBetLabel.innerText = language['game_HooHeyHow_Betting_Label'] + ' ' + language['game_HooHeyHow_Crab'];

    let placeBet = document.getElementById('placeBet');
    placeBet.style.display = 'flex';
});
document.getElementById('shrimpBet').addEventListener('click', function() {
    chosenType = 6;
    let placeBetLabel = document.getElementById('placeBetLabel');
    placeBetLabel.innerText = language['game_HooHeyHow_Betting_Label'] + ' ' + language['game_HooHeyHow_Shrimp'];

    let placeBet = document.getElementById('placeBet');
    placeBet.style.display = 'flex';
});


let iconList = ['deer.png', 'gourd.png', 'chicken.png', 'fish.png', 'crab.png', 'shrimp.png'];
let IMG = document.getElementsByClassName('LacBC');
let PlateLidPlace = document.getElementById('PlateLidPlace');
let PlateLid = document.getElementById('PlateLid');
let Lid = document.getElementById('Lid');
let LidIn = document.getElementById('LidIn');

function displayResult(result, receiveMoney) {
    PlateLidPlace.style.display = "flex";
    Lid.style.animationDirection = "initial";
    Lid.style.animationFillMode = "backwards";
    setTimeout(() => {
        PlateLid.classList.add("shake");
        IMG.forEach(function(item, index) {
            item.src = '/assets/images/hoo-hey-how/' + iconList[result[index] - 1];
        });
        setTimeout (() => {
            PlateLid.classList.remove("shake");
            LidIn.style.display = "none";
            Lid.style.display = "initial";
            Lid.style.animationDirection = "reverse";
            Lid.style.animationFillMode = "forwards";
            setTimeout (() => {
                PlateLidPlace.style.display = "none";
                IMG.forEach(function(item, index) {
                    item.src = '/assets/images/hoo-hey-how/nothing.png';
                });
                if(receiveMoney != 0 && receiveMoney != -1) swal(language[receiveMoney > 0 ? 'successLabel' : 'failedLabel'], language['game_HooHeyHow_Betting_' + (receiveMoney > 0 ? 'Win' : 'Lose')].replace('<amount>', (Math.abs(receiveMoney) / 1000) + 'k'),  receiveMoney > 0 ? 'success' : 'error');
            }, 2000);
        }, 1500);
        LidIn.style.display = "initial";
        Lid.style.display = "none";
    }, 1155);
}


$(document).ready(function() {

    retrieve('lang', {}, function(res) {
        if(res.retcode == 0) {
            language = res.data;
            var elementsWithLangAttribute = document.querySelectorAll('[zplaceholder]');
            elementsWithLangAttribute.forEach(function(element) {
                var langAttributeValue = element.getAttribute('zplaceholder');
                element.setAttribute('placeholder', language[langAttributeValue]);
            });
        }
    });

    $("#betForm").submit(function(e) {
        e.preventDefault();
        
        var formArray = $("#betForm").serializeArray();
        var formData = {};
        formArray.forEach(function(field) {
            formData[field.name] = field.value;
        });

        if(!formData.money) {
            swal(language['failedLabel'], language['game_HooHeyHow_Betting_Money_Require'], 'error');
            return;
        }

        const money = formData.money;
        if(chosenType) {
            sendMessage('bet ' + chosenType + ' ' + money);
        }
    });

});
