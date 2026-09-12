import { Module, Global } from '@nestjs/common';
import { IntegrationManager } from './integration.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.db.service';

@Global()
@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationManager, IntegrationsService],
  exports: [IntegrationManager, IntegrationsService],
})
export class IntegrationsModule {}
