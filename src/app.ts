export function main(): void {
    console.log('Hello World');
}

try {
    main();
} catch (error: unknown) {
    console.error('Error in main:', error);
}