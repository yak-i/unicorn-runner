const ROCKET = {
    imageURL: 'img/rocket.png',
    frames: [
        {
            name: 'frame-1',
            rect: [0, 0, 58, 65]
        },
    ],
    animations: [
        {
            name: 'anim',
            frameLen: 0.2,
            frames: [
                'frame-1',
            ]
        }
    ]
};

function loadRocket() {
    return loadSpriteSheet(ROCKET)
        .then(createRocketFactory);
}


class BehaviorRocket extends Trait {
    constructor() {
        super('behavior');
    }

    collides(us, them) {
        if (us.pickable.picked) {
            return;
        }

        us.pickable.pick();
        us.vel.set(30, -400);
        us.solid.obstructs = false;
    }
}


function createRocketFactory(sprite) {
    const standAnim = sprite.animations.get('anim');

    function routeAnim(rocket) {
        return standAnim(rocket.lifetime);
    }

    function drawRocket(context) {
        sprite.draw(routeAnim(this), context, 0, 0);
    }

    return function createRocket() {
        const rocket = new Entity('rocket');
        rocket.size.set(58, 45);
        rocket.offset.y = 20;

        rocket.addTrait(new Physics());
        rocket.addTrait(new Solid());
        rocket.addTrait(new Pickable());
        rocket.addTrait(new BehaviorRocket());

        rocket.draw = drawRocket;

        return rocket;
    };
}
