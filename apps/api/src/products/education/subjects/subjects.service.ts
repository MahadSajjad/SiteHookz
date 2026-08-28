import { Injectable, NotFoundException } from "@nestjs/common";
import { SubjectsRepository } from "./subjects.repository";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { CreateSubjectDto, UpdateSubjectDto } from "@sitehookz/education";
import { BusinessException } from "../../../common/exceptions/business.exception";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { P } from "@sitehookz/platform-permissions";

@Injectable()
export class SubjectsService {
  constructor(
    private readonly repository: SubjectsRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async create(tenant: TenantContext, data: CreateSubjectDto) {
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECTS.CREATE,
    );
    try {
      return await this.repository.create(tenant, data);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new BusinessException(
          "SUBJECT_CODE_DUPLICATE",
          400,
          "A subject with this code already exists.",
        );
      }
      throw error;
    }
  }

  async findAll(tenant: TenantContext) {
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECTS.READ,
    );
    return this.repository.findAll(tenant);
  }

  async findById(tenant: TenantContext, id: string) {
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECTS.READ,
    );
    const subject = await this.repository.findById(tenant, id);
    if (!subject) throw new NotFoundException("Subject not found");
    return subject;
  }

  async update(tenant: TenantContext, id: string, data: UpdateSubjectDto) {
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECTS.UPDATE,
    );
    await this.findById(tenant, id);
    try {
      return await this.repository.update(tenant, id, data);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new BusinessException(
          "SUBJECT_CODE_DUPLICATE",
          400,
          "A subject with this code already exists.",
        );
      }
      throw error;
    }
  }

  async archive(tenant: TenantContext, id: string) {
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECTS.ARCHIVE,
    );
    await this.findById(tenant, id);
    return this.repository.archive(tenant, id);
  }
}
