import { Module } from '@nestjs/common';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeImageProcessorPort } from '../../../application/workspace/themes/ports/theme-image-processor.port';
import { ThemeAssetIdentifier } from '../../../application/workspace/themes/services/theme-asset-identifier';
import { ThemeDocumentValidator } from '../../../application/workspace/themes/services/theme-document-validator';
import { ThemeIdentifier } from '../../../application/workspace/themes/services/theme-identifier';
import { ThemePermissionService } from '../../../application/workspace/themes/services/theme-permission-service';
import { ThemeSelectionService } from '../../../application/workspace/themes/services/theme-selection-service';
import { GetThemeAssetUseCase } from '../../../application/workspace/themes/use-cases/get-theme-asset-use-case';
import { ListThemesUseCase } from '../../../application/workspace/themes/use-cases/list-themes-use-case';
import { SaveThemeUseCase } from '../../../application/workspace/themes/use-cases/save-theme-use-case';
import { UploadThemeAssetUseCase } from '../../../application/workspace/themes/use-cases/upload-theme-asset-use-case';
import { ThemeRepository } from '../../../domain/theme/ports/theme-repository';
import { ThemeDocumentNormalizer } from '../../../domain/theme/services/theme-document-normalizer';
import { PrismaThemeRepository } from '../../../infrastructure/theme/prisma-theme-repository';
import { SharpThemeImageProcessor } from '../../../infrastructure/theme/sharp-theme-image-processor';
import { ThemeAssetUploadReader } from '../../../presentation/theme/graphql/theme-asset-upload-reader';
import { ThemeDocumentScalar } from '../../../presentation/theme/graphql/theme-document-scalar';
import { ThemeResolver } from '../../../presentation/theme/graphql/theme-resolver';
import { ThemeAssetController } from '../../../presentation/theme/http/theme-asset-controller';
import { DatabaseModule } from '../database/database-module';
import { IdentityModule } from '../identity/identity-module';
import { SharedServicesModule } from '../shared/shared-services.module';
@Module({
  imports: [DatabaseModule, IdentityModule, SharedServicesModule],
  providers: [
    ThemeIdentifier,
    OrganizationIdentifier,
    ThemeAssetIdentifier,
    { provide: ThemeDocumentNormalizer, useValue: new ThemeDocumentNormalizer() },
    ThemeDocumentValidator,
    PrismaThemeRepository,
    { provide: ThemeRepository, useExisting: PrismaThemeRepository },
    ThemeSelectionService,
    ThemePermissionService,
    ListThemesUseCase,
    SaveThemeUseCase,
    UploadThemeAssetUseCase,
    GetThemeAssetUseCase,
    ThemeAssetUploadReader,
    ThemeDocumentScalar,
    ThemeResolver,
    SharpThemeImageProcessor,
    { provide: ThemeImageProcessorPort, useExisting: SharpThemeImageProcessor },
  ],
  controllers: [ThemeAssetController],
  exports: [ThemeSelectionService, ThemeDocumentValidator, ThemeIdentifier],
})
export class ThemeModule {}
