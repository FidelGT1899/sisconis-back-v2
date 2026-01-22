export const TYPES = {
    // ILogger: Symbol.for("ILogger"),
    // ILogService: Symbol.for("ILogService"),

    // Shared
    PrismaService: Symbol.for("PrismaService"),
    EntityIdGenerator: Symbol.for("EntityIdGenerator"),
    AuditIdGenerator: Symbol.for("AuditIdGenerator"),
    PasswordHasher: Symbol.for("PasswordHasher"),

    // System Application
    HealthCheckUseCase: Symbol.for("HealthCheckUseCase"),
    SystemInfoUseCase: Symbol.for("SystemInfoUseCase"),
    ClockUseCase: Symbol.for("ClockUseCase"),
    ReadinessStatusUseCase: Symbol.for("ReadinessCheckUseCase"),
    // DatabaseHealthChecker: Symbol.for("DatabaseHealthChecker"),
    FeatureFlagsUseCase: Symbol.for("FeatureFlagUseCase"),

    // System Infrastructure
    SystemControllers: Symbol.for("SystemControllers"),
    HealthController: Symbol.for("HealthController"),
    SystemInfoController: Symbol.for("SystemInfoController"),
    ClockController: Symbol.for("ClockController"),
    ReadinessController: Symbol.for("ReadinessController"),
    FeatureFlagsController: Symbol.for("FeatureFlagsController"),

    // Users Domain
    UserRepository: Symbol.for("UserRepository"),

    // Users Application
    GetUsersUseCase: Symbol.for("GetUsersUseCase"),
    GetUserUseCase: Symbol.for("GetUserUseCase"),
    CreateUserUseCase: Symbol.for("CreateUserUseCase"),
    UpdateUserUseCase: Symbol.for("UpdateUserUseCase"),
    DeleteUserUseCase: Symbol.for("DeleteUserUseCase"),
    ResetUserPasswordUseCase: Symbol.for("ResetUserPasswordUseCase"),
    ChangeUserPasswordUseCase: Symbol.for("ChangeUserPasswordUseCase"),
    ChangeUserDniUseCase: Symbol.for("ChangeUserDniUseCase"),

    // Users Infrastructure
    UsersControllers: Symbol.for("UsersControllers"),
    GetUsersController: Symbol.for("GetUsersController"),
    GetUserController: Symbol.for("GetUserController"),
    CreateUserController: Symbol.for("CreateUserController"),
    UpdateUserController: Symbol.for("UpdateUserController"),
    DeleteUserController: Symbol.for("DeleteUserController"),
    ResetUserPasswordController: Symbol.for("ResetUserPasswordController"),
    ChangeUserPasswordController: Symbol.for("ChangeUserPasswordController"),
    ChangeUserDniController: Symbol.for("ChangeUserDniController"),
};
