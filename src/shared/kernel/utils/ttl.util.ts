export function ttlSecondsUntil(date: Date): number {
    const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
    return Math.max(seconds, 1); // Redis rechaza EX <= 0
}