const ARMOR = {
  imageURL: 'img/armor.png',
  frames: [
    {
      name: 'frame-1',
      rect: [0, 0, 50, 50],
    },
  ],
  animations: [
    {
      name: 'anim',
      frameLen: 0.2,
      frames: ['frame-1'],
    },
  ],
};

function loadArmor() {
  return loadSpriteSheet(ARMOR).then(createArmorFactory);
}

class BehaviorArmor extends Trait {
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

function createArmorFactory(sprite) {
  const standAnim = sprite.animations.get('anim');

  function routeAnim(armor) {
    return standAnim(armor.lifetime);
  }

  function drawArmor(context) {
    sprite.draw(routeAnim(this), context, 0, 0);
  }

  return function createArmor() {
    const armor = new Entity('armor');
    armor.size.set(50, 50);
    armor.offset.y = 20;

    armor.addTrait(new Physics());
    armor.addTrait(new Solid());
    armor.addTrait(new Pickable());
    armor.addTrait(new BehaviorArmor());

    armor.draw = drawArmor;

    return armor;
  };
}
