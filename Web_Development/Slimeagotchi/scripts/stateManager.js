let health = 50;
let happiness = 50;

export function getHealth() {
    return health;
}

export function getHappiness() {
    return happiness;
}

export function setHealth(value) {
    health = Math.max(0, Math.min(100, value));
}

export function setHappiness(value) {
    happiness = Math.max(0, Math.min(100, value));
}

export function resetGame() {
    setHealth(50);
    setHappiness(50);
}

export function checkMadState() {
    return health <= 10 && health > 0;
}

export function checkDeath() {
    return health <= 0;
}
