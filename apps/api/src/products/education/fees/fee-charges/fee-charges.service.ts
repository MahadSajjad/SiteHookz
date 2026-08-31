import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";
import {
  GenerateFeeChargesDto,
  VoidFeeChargeDto,
  FeeCharge,
  FeeFrequency,
} from "@sitehookz/education";
import { Prisma } from "@sitehookz/database";
const Decimal = Prisma.Decimal;

@Injectable()
export class FeeChargesService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(
    organizationId: string,
    assignmentId: string,
    data: GenerateFeeChargesDto,
  ): Promise<FeeCharge[]> {
    return await this.prisma.$transaction(async (tx) => {
      const assignment = await tx.enrollmentFeePlanAssignment.findUnique({
        where: { id: assignmentId, organizationId },
        include: {
          feePlan: {
            include: { items: true },
          },
          studentEnrollment: true,
        },
      });

      if (!assignment) {
        throw new NotFoundException("Fee assignment not found");
      }

      if (assignment.endedAt) {
        throw new BadRequestException(
          "Cannot generate charges for an ended assignment",
        );
      }

      const monthlyItems = assignment.feePlan.items.filter(
        (item) => item.frequency === FeeFrequency.MONTHLY,
      );

      const createdCharges: any[] = [];

      const parts = data.billingPeriodKey.split("-");
      const yearStr = parts[0] || "0";
      const monthStr = parts[1] || "0";
      const dueDate = new Date(
        parseInt(yearStr),
        parseInt(monthStr) - 1,
        assignment.feePlan.defaultDueDay || 5,
      );

      for (const item of monthlyItems) {
        // Idempotency: skip if charge already exists for this period
        const existing = await tx.feeCharge.findUnique({
          where: {
            enrollmentFeePlanAssignmentId_feePlanItemId_billingPeriodKey: {
              enrollmentFeePlanAssignmentId: assignment.id,
              feePlanItemId: item.id,
              billingPeriodKey: data.billingPeriodKey,
            },
          },
        });

        if (!existing) {
          const charge = await tx.feeCharge.create({
            data: {
              organizationId,
              enrollmentFeePlanAssignmentId: assignment.id,
              feePlanItemId: item.id,
              studentEnrollmentId: assignment.studentEnrollmentId,
              branchId: assignment.studentEnrollment.branchId,
              billingPeriodKey: data.billingPeriodKey,
              amount: item.amount,
              dueDate,
              description: item.description,
            },
          });
          createdCharges.push(charge);
        }
      }

      return createdCharges as unknown as FeeCharge[];
    });
  }

  async voidCharge(
    organizationId: string,
    membershipId: string,
    chargeId: string,
    data: VoidFeeChargeDto,
  ): Promise<FeeCharge> {
    return await this.prisma.$transaction(async (tx) => {
      const charge = await tx.feeCharge.findUnique({
        where: { id: chargeId, organizationId },
        include: { paymentAllocations: true },
      });

      if (!charge) throw new NotFoundException("Charge not found");
      if (charge.voidedAt)
        throw new BadRequestException("Charge is already voided");

      // Check for valid payments
      const totalPaid = charge.paymentAllocations.reduce(
        (sum, alloc) => sum.plus(alloc.amount),
        new Decimal(0),
      );
      if (totalPaid.greaterThan(0)) {
        throw new BadRequestException(
          "Cannot void a charge that has valid payment allocations",
        );
      }

      const updated = await tx.feeCharge.update({
        where: { id: chargeId },
        data: {
          voidedAt: new Date(),
          voidedByMembershipId: membershipId,
          voidReason: data.voidReason,
        },
      });

      return updated as unknown as FeeCharge;
    });
  }

  async calculateStatus(chargeId: string): Promise<{
    status: string;
    amountPaid: string;
    amountOutstanding: string;
  }> {
    const charge = await this.prisma.feeCharge.findUnique({
      where: { id: chargeId },
      include: {
        paymentAllocations: {
          include: { payment: true },
        },
      },
    });

    if (!charge) throw new NotFoundException();

    if (charge.voidedAt) {
      return { status: "VOIDED", amountPaid: "0", amountOutstanding: "0" };
    }

    const validAllocations = charge.paymentAllocations.filter(
      (a) => !a.payment.voidedAt,
    );
    const totalPaid = validAllocations.reduce(
      (sum, a) => sum.plus(a.amount),
      new Decimal(0),
    );
    const outstanding = charge.amount.minus(totalPaid);

    let status = "UNPAID";
    if (outstanding.equals(new Decimal(0))) {
      status = "PAID";
    } else if (totalPaid.greaterThan(0)) {
      status = "PARTIALLY_PAID";
    }

    return {
      status,
      amountPaid: totalPaid.toString(),
      amountOutstanding: outstanding.toString(),
    };
  }
}
