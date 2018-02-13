class PlayerController extends Trait {
    constructor() {
        super('playerController');
        this.checkpoint = new Vec2(0, 0);
        this.player = null;
        this.score = 0;
        this.scoreSelector = document.getElementById('unicorn-score');
        this.armorSelector = document.getElementById('armor-score');
    }

    setPlayer(entity) {
        this.player = entity;
        this.armorSelector.innerHTML = this.player.armor.getCount();

        this.player.picker.onPick = () => {
            this.score += 50;

            setTimeout(() => {
                this.scoreSelector.innerHTML = this.score;
            }, 0);
        };
        this.player.armor.onChangeArmor = () => {
            this.armorSelector.innerHTML = this.player.armor.getCount();
        }
    }

    cleanScore() {
        this.score = 0;

        setTimeout(() => {
            this.scoreSelector.innerHTML = this.score;
        }, 0);
    }

    setScore(score) {
        this.score = score;

        setTimeout(() => {
            this.scoreSelector.innerHTML = this.score;
        }, 0);
    }

    update(entity, deltaTime, level) {
        if (!level.entities.has(this.player)) {
            this.player.killable.revive();
            this.player.pos.set(this.checkpoint.x, this.checkpoint.y);
            level.entities.add(this.player);
        }
        if (this.player.pos.y > 1200) {
            this.player.killable.revive();
            this.player.pos.set(this.checkpoint.x, this.checkpoint.y);
            level.entities.add(this.player);
        }
        if (this.player.pos.x > level.levelEnd) {
            STATE = 'completed';
            document.getElementById('level-completed-wrapper').classList.add('show');
            renderLevelCompleteBlock(level.name, this.score, level.maxScore);
            document.getElementById('screen').classList.add('fade-in');
            this.player.killable.revive();
            this.player.pos.set(this.checkpoint.x, this.checkpoint.y);
            level.entities.add(this.player);
        }
    }
}

function renderLevelCompleteBlock(levelName, score, maxScore) {
    let starsCount = 0;
    if (score > 0) {
        starsCount++;
    }
    const oneThird = Math.round(maxScore / 3 / 100) * 100;
    if (starsCount === 1 && score >= oneThird) {
        starsCount++;
    }
    if (starsCount === 2 && score >= 2 * oneThird) {
        starsCount++;
    }
    clearLevelCompleteBlock();
    const wrapper = document.getElementById('level-completed-wrapper');
    const levelIndex = LEVELS_ORDER.indexOf(levelName);
    let titleNode = document.createElement('p');
    titleNode.setAttribute('class', 'level-completed-title');
    titleNode.innerText = 'Level Completed';
    let stars = document.createElement('div');
    stars.setAttribute('class', 'level-completed-stars');
    stars.innerHTML = `
        <span class="star-five ${starsCount > 0 ? 'filled' : ''}"></span>
        <span class="star-five ${starsCount > 1 ? 'filled' : ''}"></span>
        <span class="star-five ${starsCount > 2 ? 'filled' : ''}"></span>
    `;
    let scoreBlock = document.createElement('div');
    scoreBlock.setAttribute('class', 'level-completed-score');
    scoreBlock.innerHTML = `
        <div class="level-completed-score-title">Score</div>
        <div class="level-completed-score-value">${score}</div>
    `;
    let actions = document.createElement('div');
    actions.setAttribute('class', 'level-completed-actions');
    let listButton = document.createElement('div');
    let listIcon = document.createElement('i');
    listIcon.setAttribute('class', 'fa fa-list');
    listButton.appendChild(listIcon);
    listButton.addEventListener('click', () => {
        clearLevelCompleteBlock();
        document.getElementById('level-select-wrapper').classList.add('show');
        STATE = 'levelSelecting';
    });

    let refreshButton = document.createElement('div');
    let refreshIcon = document.createElement('i');
    refreshIcon.setAttribute('class', 'fa fa-refresh');
    refreshButton.appendChild(refreshIcon);
    refreshButton.addEventListener('click', () => {
        clearLevelCompleteBlock();
        main(CANVAS, LEVELS[levelName]);
    });

    let playButton = document.createElement('div');
    let playIcon = document.createElement('i');
    playIcon.setAttribute('class', 'fa fa-play');
    playButton.appendChild(playIcon);
    playButton.addEventListener('click', () => {
        if (levelIndex + 1 <= LEVELS_ORDER.length - 1) {
            clearLevelCompleteBlock();
            main(CANVAS, LEVELS[LEVELS_ORDER[levelIndex+ 1]]);
        }
    });

    actions.appendChild(listButton);
    actions.appendChild(refreshButton);
    if (levelIndex + 1 <= LEVELS_ORDER.length - 1) {
        actions.appendChild(playButton);
    }

    wrapper.appendChild(titleNode);
    wrapper.appendChild(stars);
    wrapper.appendChild(scoreBlock);
    wrapper.appendChild(actions);
}

function clearLevelCompleteBlock() {
    const wrapper = document.getElementById('level-completed-wrapper');
    const childNodes = wrapper.childNodes;
    let childNodesLength = childNodes.length;
    for (childNodesLength; childNodesLength > 0; childNodesLength--){
        wrapper.removeChild(childNodes[childNodesLength - 1]);
    }
    document.getElementById('screen').classList.remove('fade-in');
}
