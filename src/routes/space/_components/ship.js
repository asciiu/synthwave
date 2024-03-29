import * as PIXI from "pixi.js";
import { Particle } from "./particle.js";

const RADIAN_OFFSET = Math.PI / 2;

export class Ship {
  constructor({ clientID: id, image: img, x: x, y: y, app: app }) {
    this.app = app;
    this.clientID = id;
    this.particles = [];
    this.heading = new PIXI.Point(0, 0);
    this.thruster = new PIXI.Point(0, 0);
    this.velocity = new PIXI.Point(0, 0);

    const sprite = PIXI.Sprite.from(img);
    // set the anchor point so the texture is centerd on the sprite
    sprite.x = 0;
    sprite.y = 0;
    sprite.anchor.set(0.5);
    sprite.scale.set(0.02);
    this.sprite = sprite;

    // the parent container for this asset
    const container = new PIXI.Container();
    container.acceleration = new PIXI.Point(0, 0);
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    container.x = x;
    container.y = y;
    container.addChild(this.sprite);
    this.container = container;
    this.app.stage.addChild(container);

    this.heading.x = Math.cos(this.container.rotation - RADIAN_OFFSET);
    this.heading.y = Math.sin(this.container.rotation - RADIAN_OFFSET);
    this.thruster.x = Math.cos(this.container.rotation + RADIAN_OFFSET);
    this.thruster.y = Math.sin(this.container.rotation + RADIAN_OFFSET);

    this.particles = [];
    this.torpedos = [];
    this.ammoLimit = 3;
    this.recharged = true;
    this.rechargeTime = 500;
  }

  edges() {
    if (this.container.x > this.app.screen.width + this.sprite.width) {
      this.container.x = -this.sprite.width;
    } else if (this.container.x < -this.sprite.width) {
      this.container.x = this.app.screen.width + this.sprite.width;
    }
    if (this.container.y > this.app.screen.height + this.sprite.width) {
      this.container.y = -this.sprite.width;
    } else if (this.container.y < -this.sprite.width) {
      this.container.y = this.app.screen.height + this.sprite.width;
    }
  }

  render(delta) {
    this.container.x += this.velocity.x;
    this.container.y += this.velocity.y;
    this.velocity.x *= 0.99;
    this.velocity.y *= 0.99;

    this.edges();

    for (let i = this.particles.length - 1; i >= 0; --i) {
      this.particles[i].render();
      if (this.particles[i].finished()) {
        this.app.stage.removeChild(this.particles[i].sprite);
        this.particles.splice(i, 1);
      }
    }
    this.torpedos.forEach(function (torpedo, i) {
      torpedo.render();
      if (torpedo.offScreen(this.app.screen.width, this.app.screen.height)) {
        this.app.stage.removeChild(torpedo.sprite);
        this.torpedos.splice(i, 1);
      }
    }.bind(this));
  }

  fire() {
    if (this.torpedos.length >= this.ammoLimit) {
      return;
    }

    if (!this.recharged) {
      return;
    }

    let pellet = new Particle({
      x: this.container.x + this.heading.x * 6,
      y: this.container.y + this.heading.y * 6,
      width: 2,
      height: 2,
      velocityX: this.heading.x * 5,
      velocityY: this.heading.y * 5,
      projectile: true
    });

    this.app.stage.addChild(pellet.sprite);
    this.torpedos.push(pellet);

    this.recharged = false;
    setTimeout(function () {
        this.recharged = true;
    }.bind(this), this.rechargeTime);
  }

  thrust() {
    this.velocity.x += this.heading.x * 0.1;
    this.velocity.y += this.heading.y * 0.1;

    for (let i = 0; i < 5; ++i) {
      var particle = new Particle({
        x: this.container.x - this.heading.x * 6,
        y: this.container.y - this.heading.y * 6,
        width: 1,
        height: 1,
        velocityX:
          this.thruster.x * ((Math.floor(Math.random() * 51) - 40) / 100),
        velocityY:
          this.thruster.y * ((Math.floor(Math.random() * 51) - 40) / 100),
        projectile: false
      });

      this.particles.push(particle);
      this.app.stage.addChild(particle.sprite);
    }
  }

  setRotation(radian) {
    // rotate the parent container
    this.container.rotation += radian;
    // set heading vector
    this.heading.x = Math.cos(this.container.rotation - RADIAN_OFFSET);
    this.heading.y = Math.sin(this.container.rotation - RADIAN_OFFSET);
    this.thruster.x = Math.cos(this.container.rotation + RADIAN_OFFSET);
    this.thruster.y = Math.sin(this.container.rotation + RADIAN_OFFSET);
  }

  torpedo() {
    return new Particle({
      x: this.container.x + this.heading.x * 6,
      y: this.container.y + this.heading.y * 6,
      width: 2,
      height: 2,
      velocityX: this.heading.x * 5,
      velocityY: this.heading.y * 5,
      projectile: true
    });
  }
}
