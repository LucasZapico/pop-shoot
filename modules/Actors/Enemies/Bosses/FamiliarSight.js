import { Enemy } from '../Enemy.js';
import { Animation } from '../../../Effects/Misc/Animation.js';
import { Movement } from '../../../Logic/Motion/Movement.js';
import { game } from '../../../../app.js';
import { FireLaser } from '../../../Lasers/Hostile/FireLaser.js';
import { CANVAS } from '../../../Assets/Other.js';
import { flashScreen, randomInRange, shakeScreen } from '../../../Logic/Helpers.js';
import { FAMILIARSIGHTHARDENEDSPRITE, FAMILIARSIGHTSPRITE } from '../../../Assets/Enemies.js';

// MOVEMENT
const SPEED = 4;
const ENGAGEDISTANCE = 300; // Distance kept when engaging player
const SOUTH = 90; // Angle (0=EAST 90=South 180=WEST 270=NORTH)
const NORTH = 270; // Angle (0=EAST 90=South 180=WEST 270=NORTH)

// SHOOTING
const SHOWERSPEED = 8;
const BURSTSPEED = 10;
const FIRINGRATE_NORMAL = 75;
const FIRINGRATE_HARDENED = 3;
const BURSTLENGTH = 100;

// PHASES (Rates, e.g. 0.75 = when boss reaches 75% of HP)
// When the boss reaches a certain HP amount, the placers will spawn faster
// and an additional layer of lasers will be fired for each phase
const PHASE2_HP = 0.5;
const PHASE2_BURST_LENGTH = 175;
const PHASE3_HP = 0.2;
const PHASE3_BURST_LENGTH = 250;

// HARDEN
const HARDEN_RATE = 2000; // in ticks. lower = faster
const HARDEN_TIME = 10000; // in ms

// STATE
const HP = 15000;
const COINS = 60;
const RADIUS = 40;
const SPRITE = FAMILIARSIGHTSPRITE;
const NAME = 'FAMILIAR SIGHT';

export class FamiliarSight extends Enemy {
    constructor() {
        super(RADIUS, HP, COINS, SPRITE, SPEED, FIRINGRATE_NORMAL);
        // BOSS SPECIFIC ------------
        this.name = NAME;
        game.state.toggleBoss();
        // --------------------------
        this.hardened = false;
    }

    move() {
        // if out of screen, move back in
        if (!this.hardened) {
            if (this.y <= this.radius) {
                this.x += Movement.move(SOUTH, this.speed).x; //90=SOUTH
                this.y += Movement.move(SOUTH, this.speed).y; //90=SOUTH
            }
            // if lower than middle of screen, go back up
            if (this.y >= CANVAS.height * 0.5) {
                this.x += Movement.move(NORTH, this.speed).x; // 270=NORTH
                this.y += Movement.move(NORTH, this.speed).y; //270=NORTH
            }

            // follow player
            this.x += Movement.moveTowards(this.x, this.y, game.player.x, game.player.y - ENGAGEDISTANCE, this.speed).x;
            this.y += Movement.moveTowards(this.x, this.y, game.player.x, game.player.y - ENGAGEDISTANCE, this.speed).y;
        } else {
            this.x += Movement.moveTowards(this.x, this.y, CANVAS.width / 2, 90, this.speed).x;
            this.y += Movement.moveTowards(this.x, this.y, CANVAS.width / 2, 90, this.speed).y;
        }

        // Smoke effect
        if (this.steps % 10 === 0) {
            game.effects.add(new Animation(this.x, this.y - 45, 'smoke_normal'));
        }

        this.step();
    }

    shoot() {
        if (!this.hardened) {
            this.fireBursts();
        } else {
            this.fireShower();
        }
    }

    fireBursts() {
        // laser line burst
        let burstLength = BURSTLENGTH;

        if (this.hp < HP * PHASE2_HP) {
            burstLength = PHASE2_BURST_LENGTH;
        }

        if (this.hp < HP * PHASE3_HP) {
            burstLength = PHASE3_BURST_LENGTH;
        }

        const random = randomInRange(-60, 60);
        for (let i = 0; i < burstLength; i += 10) {
            setTimeout(() => {
                game.firelasers.add(new FireLaser(this.x, this.y, SOUTH - 90 + random, BURSTSPEED));
                game.firelasers.add(new FireLaser(this.x, this.y, SOUTH - 60 + random, BURSTSPEED));
                game.firelasers.add(new FireLaser(this.x, this.y, SOUTH - 30 + random, BURSTSPEED));
                game.firelasers.add(new FireLaser(this.x, this.y, SOUTH + random, BURSTSPEED));
                game.firelasers.add(new FireLaser(this.x, this.y, SOUTH + 30 + random, BURSTSPEED));
                game.firelasers.add(new FireLaser(this.x, this.y, SOUTH + 60 + random, BURSTSPEED));
                game.firelasers.add(new FireLaser(this.x, this.y, SOUTH + 90 + random, BURSTSPEED));
            }, i);
        }
    }

    fireShower() {
        shakeScreen(5, 0.25);

        const randomdirection = randomInRange(0, 180);
        for (let i = 0; i <= 6; i += 2) {
            game.firelasers.add(new FireLaser(this.x, this.y + i, randomdirection, SHOWERSPEED));
        }
    }

    takeDamage(damage) {
        super.takeDamage(damage);
        shakeScreen(2, 0.25);
    }

    step() {
        super.step();

        // Harden
        if (this.steps % HARDEN_RATE === 0) {
            this.harden();
        }
    }

    soften() {
        game.audiocontroller.playSound('powerDown');
        game.audiocontroller.stopSound('familiarMg');
        this.sprite = FAMILIARSIGHTSPRITE;
        this.firingrate = game.state.slowmo ? FIRINGRATE_NORMAL / game.state.variables.slowmorate : FIRINGRATE_NORMAL;
        this.hardened = false;
        flashScreen();
        shakeScreen(3, 0.5);
    }

    harden() {
        game.audiocontroller.playSound('powerDown');
        game.audiocontroller.playSound('familiarMg');
        this.firingrate = game.state.slowmo ? FIRINGRATE_NORMAL * game.state.variables.slowmorate : FIRINGRATE_HARDENED;
        this.sprite = FAMILIARSIGHTHARDENEDSPRITE;
        this.hardened = true;
        game.enemies.clear();
        flashScreen();
        shakeScreen(3, 0.5);

        setTimeout(() => {
            this.soften();
        }, HARDEN_TIME);
    }

    die() {
        super.die();
        game.audiocontroller.playSound('exp_big');
        shakeScreen(6, 2);
        game.state.toggleBoss();
    }
}
