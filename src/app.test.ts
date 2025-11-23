import { main } from "./app";

describe('App', () => {
    it('should execute main function without errors', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        main();
        
        expect(consoleSpy).toHaveBeenCalledWith('Hello World');
        consoleSpy.mockRestore();
    });
});