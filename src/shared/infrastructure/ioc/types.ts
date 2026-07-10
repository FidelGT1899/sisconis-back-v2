export const TYPES = {
    // ILogService: Symbol.for("ILogService"),

    // Shared
    PrismaService: Symbol.for("PrismaService"),
    EntityIdGenerator: Symbol.for("EntityIdGenerator"),
    AuditIdGenerator: Symbol.for("AuditIdGenerator"),
    PasswordHasher: Symbol.for("PasswordHasher"),
    Logger: Symbol.for("Logger"),
    GlobalErrorMiddleware: Symbol.for("GlobalErrorMiddleware"),

    // System Application
    HealthCheckUseCase: Symbol.for("HealthCheckUseCase"),
    SystemInfoUseCase: Symbol.for("SystemInfoUseCase"),
    ClockUseCase: Symbol.for("ClockUseCase"),
    ReadinessStatusUseCase: Symbol.for("ReadinessCheckUseCase"),
    // DatabaseHealthChecker: Symbol.for("DatabaseHealthChecker"),
    FeatureFlagsUseCase: Symbol.for("FeatureFlagUseCase"),

    // System Infrastructure
    SystemRouter: Symbol.for("SystemRouter"),
    HealthController: Symbol.for("HealthController"),
    SystemInfoController: Symbol.for("SystemInfoController"),
    ClockController: Symbol.for("ClockController"),
    ReadinessController: Symbol.for("ReadinessController"),
    FeatureFlagsController: Symbol.for("FeatureFlagsController"),

    // Users Domain
    UserRepository: Symbol.for("UserRepository"),

    // Roles Domain
    RoleRepository: Symbol.for("RoleRepository"),

    // Users Application
    GetUsersUseCase: Symbol.for("GetUsersUseCase"),
    GetUserUseCase: Symbol.for("GetUserUseCase"),
    CreateUserUseCase: Symbol.for("CreateUserUseCase"),
    UpdateUserProfileUseCase: Symbol.for("UpdateUserProfileUseCase"),
    UpdateUserByAdminUseCase: Symbol.for("UpdateUserByAdminUseCase"),
    DeleteUserUseCase: Symbol.for("DeleteUserUseCase"),
    ResetUserPasswordUseCase: Symbol.for("ResetUserPasswordUseCase"),
    ChangeUserPasswordUseCase: Symbol.for("ChangeUserPasswordUseCase"),
    ChangeUserDniUseCase: Symbol.for("ChangeUserDniUseCase"),
    UpdateUserRoleUseCase: Symbol.for("UpdateUserRoleUseCase"),
    SuspendUserUseCase: Symbol.for("SuspendUserUseCase"),
    ActivateUserUseCase: Symbol.for("ActivateUserUseCase"),
    DeactivateUserUseCase: Symbol.for("DeactivateUserUseCase"),

    // Roles Application
    GetRolesUseCase: Symbol.for("GetRolesUseCase"),
    GetRoleUseCase: Symbol.for("GetRoleUseCase"),
    CreateRoleUseCase: Symbol.for("CreateRoleUseCase"),
    UpdateRoleUseCase: Symbol.for("UpdateRoleUseCase"),
    DeleteRoleUseCase: Symbol.for("DeleteRoleUseCase"),
    ActivateRoleUseCase: Symbol.for("ActivateRoleUseCase"),
    DeactivateRoleUseCase: Symbol.for("DeactivateRoleUseCase"),

    // Users Infrastructure
    UsersRouter: Symbol.for("UsersRouter"),
    GetUsersController: Symbol.for("GetUsersController"),
    GetUserController: Symbol.for("GetUserController"),
    CreateUserController: Symbol.for("CreateUserController"),
    UpdateUserProfileController: Symbol.for("UpdateUserProfileController"),
    UpdateUserByAdminController: Symbol.for("UpdateUserByAdminController"),
    DeleteUserController: Symbol.for("DeleteUserController"),
    ResetUserPasswordController: Symbol.for("ResetUserPasswordController"),
    ChangeUserPasswordController: Symbol.for("ChangeUserPasswordController"),
    ChangeUserDniController: Symbol.for("ChangeUserDniController"),
    UpdateUserRoleController: Symbol.for("UpdateUserRoleController"),
    SuspendUserController: Symbol.for("SuspendUserController"),
    ActivateUserController: Symbol.for("ActivateUserController"),
    DeactivateUserController: Symbol.for("DeactivateUserController"),

    // Roles Infrastructure
    RolesRouter: Symbol.for("RolesRouter"),
    GetRolesController: Symbol.for("GetRolesController"),
    GetRoleController: Symbol.for("GetRoleController"),
    CreateRoleController: Symbol.for("CreateRoleController"),
    UpdateRoleController: Symbol.for("UpdateRoleController"),
    DeleteRoleController: Symbol.for("DeleteRoleController"),
    ActivateRoleController: Symbol.for("ActivateRoleController"),
    DeactivateRoleController: Symbol.for("DeactivateRoleController"),
};
