const fs = require("fs");
const path = require("path");

const baseDir = path.join("apps", "api", "src", "products", "education");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
}

// COURSES
writeFile(
  path.join(baseDir, "courses", "courses.controller.ts"),
  `
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { RequirePermission, PermissionGuard } from '../../../platform/authorization/permission.guard';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';

@Controller('education/courses')
@UseGuards(PermissionGuard)
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get()
  @RequirePermission('education.courses.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(':id')
  @RequirePermission('education.courses.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission('education.courses.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(':id')
  @RequirePermission('education.courses.update')
  async update(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenant, id, dto);
  }
}
`,
);

writeFile(
  path.join(baseDir, "courses", "courses.service.ts"),
  `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: any) {
    return this.prisma.course.findMany({ where: { organizationId: tenant.organizationId } });
  }

  async findOne(tenant: TenantContext, id: string) {
    const item = await this.prisma.course.findUnique({ where: { id, organizationId: tenant.organizationId } });
    if (!item) throw new NotFoundException('COURSE_NOT_FOUND');
    return item;
  }

  async create(tenant: TenantContext, dto: any) {
    return this.prisma.course.create({ data: { organizationId: tenant.organizationId, ...dto } });
  }

  async update(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.course.update({ where: { id, organizationId: tenant.organizationId }, data: dto });
  }
}
`,
);

writeFile(
  path.join(baseDir, "courses", "courses.module.ts"),
  `
import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService]
})
export class CoursesModule {}
`,
);

// BATCHES
writeFile(
  path.join(baseDir, "batches", "batches.controller.ts"),
  `
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { RequirePermission, PermissionGuard } from '../../../platform/authorization/permission.guard';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';

@Controller('education/batches')
@UseGuards(PermissionGuard)
export class BatchesController {
  constructor(private readonly service: BatchesService) {}

  @Get()
  @RequirePermission('education.batches.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(':id')
  @RequirePermission('education.batches.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission('education.batches.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(':id')
  @RequirePermission('education.batches.update')
  async update(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenant, id, dto);
  }
}
`,
);

writeFile(
  path.join(baseDir, "batches", "batches.service.ts"),
  `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: any) {
    return this.prisma.batch.findMany({ where: { organizationId: tenant.organizationId } });
  }

  async findOne(tenant: TenantContext, id: string) {
    const item = await this.prisma.batch.findUnique({ where: { id, organizationId: tenant.organizationId } });
    if (!item) throw new NotFoundException('BATCH_NOT_FOUND');
    return item;
  }

  async create(tenant: TenantContext, dto: any) {
    return this.prisma.batch.create({ data: { organizationId: tenant.organizationId, startDate: new Date(), ...dto } });
  }

  async update(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.batch.update({ where: { id, organizationId: tenant.organizationId }, data: dto });
  }
}
`,
);

writeFile(
  path.join(baseDir, "batches", "batches.module.ts"),
  `
import { Module } from '@nestjs/common';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

@Module({
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService]
})
export class BatchesModule {}
`,
);

// Add to education.module.ts
let edModule = fs.readFileSync(
  path.join(baseDir, "education.module.ts"),
  "utf8",
);
edModule =
  `import { CoursesModule } from './courses/courses.module';\nimport { BatchesModule } from './batches/batches.module';\n` +
  edModule;
edModule = edModule.replace(
  "imports: [",
  "imports: [\n    CoursesModule,\n    BatchesModule,",
);
fs.writeFileSync(path.join(baseDir, "education.module.ts"), edModule, "utf8");

console.log("Tuition backend generated.");
