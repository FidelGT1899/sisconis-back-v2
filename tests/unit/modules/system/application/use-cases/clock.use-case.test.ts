import { ClockUseCase } from '@system-application/use-cases/clock.use-case';
import { Clock } from '@system-domain/clock';

describe('ClockUseCase', () => {
    it('should return the current clock with consistent fields', async () => {
        const useCase = new ClockUseCase();
        const before = Date.now();

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        const clock = result.value();
        expect(clock).toBeInstanceOf(Clock);
        expect(clock.timestamp).toBeInstanceOf(Date);
        expect(clock.iso).toBe(clock.timestamp.toISOString());
        expect(clock.unix).toBe(Math.floor(clock.timestamp.getTime() / 1000));
        expect(clock.timestamp.getTime()).toBeGreaterThanOrEqual(before);
    });
});