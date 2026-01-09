import { container } from "@shared-kernel/ioc/container";
import { TYPES } from "@shared-kernel/ioc/types";
import { FeatureFlagsUseCase } from "@system-application/use-cases/feature-flags.use-case";
import type { Request, Response, NextFunction } from "express";

export function requireFeatureFlag(flagName: string) {
    return async (_req: Request, res: Response, next: NextFunction) => {
        const useCase = container.get<FeatureFlagsUseCase>(TYPES.FeatureFlagsUseCase);
        const result = await useCase.execute();

        if (result.isErr()) {
            return res.status(503).json({ error: "Feature flags unavailable" });
        }

        const flags = result.value();
        const flag = flags.find(f => f.name === flagName);

        if (!flag?.enabled) {
            return res.status(403).json({
                error: "Feature not available",
                feature: flagName
            });
        }

        next();
    };
}
