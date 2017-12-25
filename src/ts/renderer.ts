namespace Renderer {
    export interface Renderer {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        spriteSheet: SpriteSheet.SpriteSheet;
        clock: Clock.Clock
    }

    export function create(canvasId: string, spriteSheetId: string) : Renderer {
        let canvas = <HTMLCanvasElement>document.querySelector(canvasId);
        let context : CanvasRenderingContext2D =
            // force CanvasRenderingContext2D to be returned
            // instead of nullable context
            (() => {
                let x = canvas.getContext("2d");
                if (x != null) {
                    return x;
                } else {
                    throw `Cannot get CanvasRenderingContext2D from element with id #${canvas}`
                }
            })();

        return {
            canvas: canvas,
            context: context,
            spriteSheet: SpriteSheet.create(spriteSheetId),
            clock: Clock.create()
        };
    }

    export function drawFrame(r: Renderer, gameState: GameState.GameState): void {
        Clock.update(r.clock);
        const dt = r.clock.deltaTime;

        clearFrame(r);
        drawBackground(r);
        drawPlayer(r, gameState.player);
        drawLaserSight(r, gameState.player);
        gameState.projectiles.forEach((p) => drawProjectile(r, p));
        gameState.enemies.forEach((e) => drawEnemy(r, dt, e));
        gameState.enemies.forEach((e) => drawHealthBar(r, e));
    }

    // private
    function clearFrame(r: Renderer): void {
        r.context.clearRect(0, 0, r.canvas.width, r.canvas.height);
    }

    function drawSprite(r: Renderer, spriteId: string, position: Core.Point) {
        const sprite = r.spriteSheet.sprites[spriteId];
        r.context.drawImage(r.spriteSheet.image, sprite.srcX, sprite.srcY, sprite.w, sprite.h,
                            position.x, position.y, sprite.w, sprite.h);
    }

    function drawAnimatedSprite(r: Renderer, spriteId: string, spriteIndex: number,
                                deltaTime: number, position: Core.Point) {

        const animatedSprite = r.spriteSheet.animatedSprites[spriteId];
        SpriteSheet.incrementFrame(animatedSprite, deltaTime);
        const sprite = SpriteSheet.getSprite(animatedSprite, spriteIndex);

        r.context.drawImage(r.spriteSheet.image, sprite.srcX, sprite.srcY, sprite.w, sprite.h,
                            position.x, position.y, sprite.w, sprite.h);
    }

    function drawBackground(r: Renderer) {
        const sprite = r.spriteSheet.sprites[SpriteSheet.SpriteIds.Grass];
        for(let x = 0; x < r.canvas.width; x += sprite.w) {
            for(let y = 0; y < r.canvas.height; y += sprite.h) {
                r.context.drawImage(r.spriteSheet.image, sprite.srcX, sprite.srcY,
                    sprite.w, sprite.h, x, y, sprite.w, sprite.h);
            }
        }
    }

    function drawPlayer(r: Renderer, p: Player.Player): void {
        drawSprite(r, SpriteSheet.SpriteIds.Player, p.position);
    }

    function drawLaserSight(r: Renderer, p: Player.Player): void {
        r.context.beginPath();
        r.context.moveTo(p.position.x + p.size / 2, p.position.y + p.size / 2);
        r.context.lineTo(InputManager.mouseState.x, InputManager.mouseState.y);
        r.context.strokeStyle = "red";
        r.context.lineWidth = 1;
        r.context.stroke();
        r.context.closePath();
    }

    function drawProjectile(r: Renderer, p: Projectile.Projectile) {
        drawSprite(r, SpriteSheet.SpriteIds.Projectile, p.position);
    }

    function drawEnemy(r: Renderer, deltaTime: number, e: Enemy.Enemy) {
        const spriteIndex = Enemy.getDirection(e);
        drawAnimatedSprite(r, SpriteSheet.SpriteIds.Bug, spriteIndex, deltaTime, e.position);
    }

    function drawHealthBar(r: Renderer, e: Enemy.Enemy) {
        const barOffset = 5; // px above enemy

        const barLength = e.size;
        const remainingHealth = e.currentHealth / e.maxHealth;
        const healthyPortion = barLength * remainingHealth;
        const damagedPortion = barLength * (1.0 - remainingHealth);

        r.context.lineWidth = 2;

        r.context.beginPath();
        r.context.moveTo(e.position.x, e.position.y - barOffset)
        r.context.lineTo(e.position.x + healthyPortion, e.position.y - barOffset);
        r.context.strokeStyle = "lawngreen";
        r.context.stroke();
        r.context.closePath();

        if(damagedPortion > 0.0) {
            r.context.beginPath();
            r.context.moveTo(e.position.x + healthyPortion, e.position.y - barOffset)
            r.context.lineTo(e.position.x + barLength, e.position.y - barOffset);
            r.context.strokeStyle = "red";
            r.context.stroke();
            r.context.closePath();
        }
    }
}
