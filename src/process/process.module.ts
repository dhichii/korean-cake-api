import { Module } from '@nestjs/common';
import { ProcessRepository } from './infrastructure/process.repository';
import { ProcessService } from './application/process.service';
import { ProcessController } from './interface/http/process.controller';

@Module({
  controllers: [ProcessController],
  providers: [
    {
      provide: 'IProcessRepository',
      useClass: ProcessRepository,
    },
    {
      provide: 'IProcessService',
      useClass: ProcessService,
    },
  ],
  exports: ['IProcessService'],
})
export class ProcessModule {}
