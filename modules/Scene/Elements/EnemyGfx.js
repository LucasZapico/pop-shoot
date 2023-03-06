import { game } from '../../../app.js';
import { RedPackage } from '../../Actors/Packages/RedPackage.js';
import { LIGHTBEAMSPRITE } from '../../Assets/Effects.js';
import { SceneUtils } from '../SceneUtils.js';

// BOSS BAR
const BOSSBAR_X = 690;
const BOSSBAR_Y = 10;
const BOSSBAR_WIDTH = 296;
const BOSSBAR_HEIGHT = 11;
const BOSSNAME_X = 690;
const BOSSNAME_Y = 40;

export class EnemyGfx {
    static drawHealthbar(enemy) {
        // Normal Enemy
        if (enemy.hitRatio !== 1 && !enemy.name) {
            SceneUtils.drawBar(
                enemy.x - enemy.sprite.width / 2,
                enemy.y - enemy.sprite.height / 1.25,
                enemy.sprite.width,
                1.5,
                enemy.hitRatio
            );
        }

        // Boss
        if (enemy.name) {
            SceneUtils.drawBigBar(BOSSBAR_X, BOSSBAR_Y, BOSSBAR_WIDTH, BOSSBAR_HEIGHT, enemy.hitRatio);
            SceneUtils.drawText(enemy.name, BOSSNAME_X, BOSSNAME_Y, 30);
        }
    }

    static drawLightbeam(enemy) {
        if (enemy.constructor === RedPackage) {
            game.scene.ctx.drawImage(LIGHTBEAMSPRITE, enemy.x - LIGHTBEAMSPRITE.width / 2, 0);
        }
    }

    static drawSprite(enemy) {
        // Enemy Sprite
        game.scene.ctx.drawImage(
            enemy.sprite,
            SceneUtils.offsetCoordinates(enemy).x,
            SceneUtils.offsetCoordinates(enemy).y
        );
    }
}
