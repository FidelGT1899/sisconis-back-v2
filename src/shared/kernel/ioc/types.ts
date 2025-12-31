export const TYPES = {
    // ILogger: Symbol.for("ILogger"),
    // ILogService: Symbol.for("ILogService"),

    // Shared
    PrismaClient: Symbol.for("PrismaClient"),
    IdGenerator: Symbol.for("IdGenerator"),

    // Users Domain
    UserRepository: Symbol.for("UserRepository"),

    // Users Application
    GetUsersUseCase: Symbol.for("GetUsersUseCase"),
    GetUserUseCase: Symbol.for("GetUserUseCase"),
    CreateUserUseCase: Symbol.for("CreateUserUseCase"),
    UpdateUserUseCase: Symbol.for("UpdateUserUseCase"),
    DeleteUserUseCase: Symbol.for("DeleteUserUseCase"),

    // Users Infrastructure
    UsersControllers: Symbol.for("UsersControllers"),
    GetUsersController: Symbol.for("GetUsersController"),
    GetUserController: Symbol.for("GetUserController"),
    CreateUserController: Symbol.for("CreateUserController"),
    UpdateUserController: Symbol.for("UpdateUserController"),
    DeleteUserController: Symbol.for("DeleteUserController"),
};
