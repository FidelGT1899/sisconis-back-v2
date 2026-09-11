process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL = 'postgresql://mock_user:mock_pass@localhost:5432/mock_db';
process.env.JWT_SECRET = 'mock_jwt_secret_must_be_at_least_32_characters_long_for_testing!';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.TRUST_PROXY = 'false';
