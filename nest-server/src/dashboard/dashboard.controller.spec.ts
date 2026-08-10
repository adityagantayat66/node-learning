import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './service/dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getAllUsers: jest.fn().mockReturnValue([]),
            getUserByEmail: jest.fn().mockReturnValue(null),
            getCompanyInfo: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

