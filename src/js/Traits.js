class Physics extends Trait {
  constructor() {
    super('physics');
  }

  update(entity, deltaTime, level) {
    entity.pos.x += entity.vel.x * deltaTime;
    level.tileCollider.checkX(entity);

    entity.pos.y += entity.vel.y * deltaTime;
    level.tileCollider.checkY(entity);

    entity.vel.y += level.gravity * deltaTime;
  }
}

class Solid extends Trait {
  constructor() {
    super('solid');
    this.obstructs = true;
  }

  obstruct(entity, side, match) {
    if (!this.obstructs) {
      return;
    }

    if (side === Sides.BOTTOM) {
      entity.bounds.bottom = match.y1;
      entity.vel.y = 0;
    } else if (side === Sides.TOP) {
      entity.bounds.top = match.y2;
      entity.vel.y = 0;
    } else if (side === Sides.LEFT) {
      entity.bounds.left = match.x2;
      entity.vel.x = 0;
    } else if (side === Sides.RIGHT) {
      entity.bounds.right = match.x1;
      entity.vel.x = 0;
    }
  }
}

class Run extends Trait {
  constructor() {
    super('run');

    this.speed = 13000;
    this.distance = 0;
  }

  update(entity, deltaTime) {
    entity.vel.x = this.speed * deltaTime;
    this.distance += Math.abs(entity.vel.x) * deltaTime;
  }
}

class Armor extends Trait {
  constructor() {
    super('armor');
    let count = 1;
    const self = this;
    this.collided = false;
    this.incrementCount = function(c) {
      if (c) {
        count += c;
      } else {
        count++;
      }
      this.onChangeArmor();
    };
    this.decrementCount = function() {
      count--;
      this.onChangeArmor();
      this.collided = true;
      setTimeout(() => {
        self.collided = false;
      }, 3 * 1000);
    };
    this.getCount = function() {
      return count;
    };
  }
}

class Jump extends Trait {
  constructor() {
    super('jump');

    this.ready = 0;
    this.duration = 0.8;
    this.engageTime = 0;
    this.requestTime = 0;
    this.gracePeriod = 0.1;
    this.speedBoost = 0.3;
    this.velocity = 200;
  }

  get falling() {
    return this.ready < 0;
  }

  start() {
    this.requestTime = this.gracePeriod;
  }

  cancel() {
    this.engageTime = 0;
    this.requestTime = 0;
  }

  obstruct(entity, side) {
    if (side === Sides.BOTTOM) {
      this.ready = 1;
    } else if (side === Sides.TOP) {
      this.cancel();
    }
  }

  update(entity, deltaTime) {
    if (this.requestTime > 0) {
      if (this.ready > 0) {
        this.engageTime = this.duration;
        this.requestTime = 0;
      }

      this.requestTime -= deltaTime;
    }

    if (this.engageTime > 0) {
      entity.vel.y = -(this.velocity + Math.abs(entity.vel.x) * this.speedBoost);
      this.engageTime -= deltaTime;
    }

    this.ready--;
  }
}

class Fly extends Trait {
  constructor() {
    super('fly');
    this.active = false;
    this.speedBoost = 0.3;
    this.velocity = 200;
    let secs = 2;
    this.addSeconds = function(s) {
      secs += s;
      this.onChangeFlyingSec();
    };
    this.getSeconds = function() {
      return secs;
    };
  }

  start() {
    this.active = true;
  }
  cancel() {
    this.active = false;
  }

  update(entity, deltaTime) {
    if (this.active) {
      if (this.getSeconds() > 0) {
        if (entity.pos.y > 50) {
          entity.vel.y = -(this.velocity + Math.abs(entity.vel.x) * this.speedBoost);
        } else {
          entity.pos.y = 50;
        }
        this.addSeconds(-deltaTime);
      } else {
        this.addSeconds(-this.getSeconds());
      }
    }
  }
}

class Killable extends Trait {
  constructor() {
    super('killable');
    this.dead = false;
    this.deadTime = 0;
    this.removeAfter = 0.3;
  }

  kill() {
    this.queue(() => (this.dead = true));
  }

  revive() {
    this.dead = false;
    this.deadTime = 0;
  }

  update(entity, deltaTime, level) {
    if (this.dead) {
      this.deadTime += deltaTime;
      if (this.deadTime > this.removeAfter) {
        this.queue(() => {
          level.entities.delete(entity);
        });
      }
    }
  }
}

class Pickable extends Trait {
  constructor() {
    super('pickable');
    this.picked = false;
    this.pickTime = 0;
    this.removeAfter = 0.3;
  }

  pick() {
    this.queue(() => (this.picked = true));
  }

  update(entity, deltaTime, level) {
    if (this.picked) {
      this.pickTime += deltaTime;
      if (this.pickTime > this.removeAfter) {
        this.queue(() => {
          level.entities.delete(entity);
        });
      }
    }
  }
}

class Picker extends Trait {
  constructor() {
    super('picker');
    this.onPick = function() {};
  }

  collides(us, them) {
    if (!them.pickable || them.pickable.picked) {
      return;
    }

    switch (them.name) {
      case 'rainbow': {
        this.onPick(us, them);
        break;
      }
      case 'rocket': {
        us.fly.addSeconds(2.5);
        break;
      }
      case 'armor': {
        us.armor.incrementCount(0.5);
        break;
      }
    }
  }
}
