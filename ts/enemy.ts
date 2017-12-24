namespace Enemy {
    export interface Enemy extends Core.Body2d {
        health: number;
    }

    export function create(x: number, y: number): Enemy {
        return {
            position: {
                x: x,
                y: y
            },
            size: 30,
            speed: 0.2,
            health: 3
        }
    }

    export function move(e: Enemy, p: Player.Player) {
        if(e.position.x < p.position.x) {
            e.position.x += e.speed;
        } else if(e.position.x > p.position.x) {
            e.position.x -= e.speed;
        }

        if(e.position.y < p.position.y) {
            e.position.y += e.speed;
        } else if(e.position.y > p.position.y) {
            e.position.y -= e.speed;
        }
    }

    export function isAlive(e: Enemy): boolean {
        return e.health > 0;
    }

    export function damage(e: Enemy, amount: number) {
        e.health -= amount;
    }
}
