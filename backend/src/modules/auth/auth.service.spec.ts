import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../common/database/repository/user.repository';
import { AuthService } from './auth.service';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthTokenService } from './services/auth-token.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: AuthOtpService,
          useValue: {
            generateOtpPayload: jest.fn(),
            sendOtpEmail: jest.fn(),
            assertOtpIsValid: jest.fn(),
          },
        },
        {
          provide: AuthTokenService,
          useValue: {
            signAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
