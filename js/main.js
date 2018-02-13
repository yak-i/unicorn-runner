function loadChars() {
    const entityFactories = {};

    function addFactory(name) {
        return factory => entityFactories[name] = factory;
    }


    return Promise.all([
        loadUnicorn().then(addFactory('unicorn')),
        loadEnemyBug().then(addFactory('enemyBug')),
        loadRainbow().then(addFactory('rainbow')),
    ])
    .then(() => entityFactories);
}

function createPlayerEnv(playerEntity) {
    const playerEnv = new Entity();
    const playerControl = new PlayerController();
    playerControl.checkpoint.set(64, 64);
    playerControl.setPlayer(playerEntity);
    playerControl.cleanScore();
    playerEnv.addTrait(playerControl);
    return playerEnv;
}

let context = null;
let charsFactory = null;
let loadLevel = null;
let level = null;
let camera = null;
let playerEnv = null;
let unicorn = null;
let timer = null;

let listenersIsAdded = false;

let STATE = 'start'; // start, game, pause, completed, levelSelecting, bonus

let levelSelectInnerHTML = '';
Object.keys(LEVELS).forEach((level) => {
    levelSelectInnerHTML += `
<li class="cards__item" data-level=${level}>
    <div class="card">
        <div class="card__image" style="background-image: url(${LEVELS[level].previewImage})"></div>
        <div class="card__content">
            <div class="card__title">${LEVELS[level].title}</div>
        </div>
    </div>
</li>`;
});

document.getElementById('level-select').innerHTML = levelSelectInnerHTML;

async function main(canvas, selectedLevel) {
    STATE = 'game';
    context = canvas.getContext('2d');
    charsFactory = await loadChars();
    loadLevel = await createLevelLoader(charsFactory);
    level = await loadLevel(selectedLevel);
    camera = new Camera();
    unicorn = charsFactory.unicorn();
    playerEnv = createPlayerEnv(unicorn);

    level.entities.add(playerEnv);

    if (!timer) timer = new Timer(1/60);
    timer.update = function update(deltaTime) {
        level.update(deltaTime);
        camera.pos.x = Math.max(0, unicorn.pos.x - 100);
        level.comp.draw(context, camera);
    };

    if (!listenersIsAdded) {
        ['keydown', 'keyup'].forEach(function (eventName) {
            window.addEventListener(eventName, function (event) {
                if (event.code === 'Space' && STATE === 'game') {
                    const keyState = event.type === 'keydown' ? 1 : 0;

                    if (keyState > 0) {
                        unicorn.jump.start();
                    } else {
                        unicorn.jump.cancel();
                    }
                } else {
                    if (event.type === 'keyup' && event.code === 'KeyP' && (STATE === 'game' || STATE === 'pause')) {
                        STATE = STATE === 'pause' ? 'game' : 'pause';
                        document.getElementById('menu-wrapper').classList[STATE === 'pause' ? 'add' : 'remove']('show');
                        document.getElementById('screen').classList[STATE === 'pause' ? 'add' : 'remove']('fade-in');
                    }
                    unicorn.jump.cancel();
                }
            });
        });
        document.getElementById('menu').addEventListener('click', function (ev) {
            if (ev.target.nodeName === 'LI') {
                const action = ev.target.getAttribute('data-action');
                switch (action) {
                    case 'continue': {
                        STATE = 'game';
                        document.getElementById('menu-wrapper').classList.remove('show');
                        document.getElementById('screen').classList.remove('fade-in');
                        break;
                    }
                    case 'changeLocation': {
                        STATE = 'levelSelecting';
                        document.getElementById('level-select-wrapper').classList.add('show');
                        document.getElementById('menu-wrapper').classList.remove('show');
                        break;
                    }
                    case 'bonus': {
                        STATE = 'bonus';
                        document.getElementById('buy-bonus-wrapper').classList.add('show');
                        document.getElementById('menu-wrapper').classList.remove('show');
                        break;
                    }
                }
            }
        });
        document.getElementById('bonus-menu').addEventListener('click', function (ev) {
            const bonusItem = findAncestor(ev.target, 'bonus-menu-item');
            if (bonusItem) {
                const bonusType = bonusItem.getAttribute('data-type');
                switch (bonusType) {
                    case 'armor': {
                        if (playerEnv.playerController.score >= 200) {
                            unicorn.armor.incrementCount();
                            unicorn.armor.onChangeArmor();
                            playerEnv.playerController.setScore(playerEnv.playerController.score - 200);
                        }
                        break;
                    }
                }
                STATE = 'game';
                document.getElementById('buy-bonus-wrapper').classList.remove('show');
                document.getElementById('screen').classList.remove('fade-in');
            }
        });
        listenersIsAdded = true;
    }

    timer.start();
}

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

document.getElementById('level-select').addEventListener('click', function (ev) {
    var levelCard = findAncestor(ev.target, 'cards__item');
    if (levelCard) {
        var level = levelCard.getAttribute('data-level');
        document.getElementById('level-select-wrapper').classList.remove('show');
        document.getElementById('screen').classList.remove('fade-in');
        main(CANVAS, LEVELS[level]);
    }
});