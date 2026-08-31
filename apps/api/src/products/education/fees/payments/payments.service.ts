import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service';
import { CreatePaymentDto, VoidPaymentDto, Payment } from '@sitehookz/education';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, membershipId: string, data: CreatePaymentDto): Promise<Payment> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Generate Receipt Number
      const branch = await tx.branch.findUnique({ where: { id: data.branchId, organizationId } });
      if (!branch) throw new NotFoundException('Branch not found');

      const sequence = await tx.paymentReceiptSequence.upsert({
        where: { organizationId_branchId: { organizationId, branchId: data.branchId } },
        create: { organizationId, branchId: data.branchId, nextValue: 2 },
        update: { nextValue: { increment: 1 } },
      });
      const receiptNumber = `${branch.code}-${String(sequence.nextValue - 1).padStart(6, '0')}`;

      // 2. Validate Allocations
      let totalAllocated = new Decimal(0);
      const chargeUpdates = [];

      for (const alloc of data.allocations) {
        const allocAmount = new Decimal(alloc.amount);
        if (allocAmount.lte(0)) throw new BadRequestException('Allocation amount must be positive');
        totalAllocated = totalAllocated.plus(allocAmount);

        // Fetch charge with FOR UPDATE equivalent (using standard findUnique within serializable tx usually suffices, or raw query)
        const [charge] = await tx.$queryRaw<any[]>`SELECT id, amount, "voidedAt" FROM "FeeCharge" WHERE id = ${alloc.feeChargeId}::uuid AND "organizationId" = ${organizationId}::uuid FOR UPDATE`;
        
        if (!charge) throw new NotFoundException(`Charge ${alloc.feeChargeId} not found`);
        if (charge.voidedAt) throw new BadRequestException(`Charge ${alloc.feeChargeId} is voided`);

        // Check outstanding
        const existingAllocs = await tx.paymentAllocation.findMany({
          where: { feeChargeId: alloc.feeChargeId, payment: { voidedAt: null } },
        });
        const alreadyPaid = existingAllocs.reduce((sum, a) => sum.plus(a.amount), new Decimal(0));
        const outstanding = new Decimal(charge.amount).minus(alreadyPaid);

        if (allocAmount.greaterThan(outstanding)) {
          throw new BadRequestException(`Allocation ${allocAmount} exceeds outstanding ${outstanding} for charge ${alloc.feeChargeId}`);
        }
      }

      if (!totalAllocated.equals(new Decimal(data.amount))) {
        throw new BadRequestException(`Total allocations ${totalAllocated} do not match payment amount ${data.amount}`);
      }

      // 3. Create Payment
      const paymentDate = data.paymentDate instanceof Date ? data.paymentDate : new Date(data.paymentDate);

      const payment = await tx.payment.create({
        data: {
          organizationId,
          branchId: data.branchId,
          studentId: data.studentId,
          receiptNumber,
          amount: data.amount,
          paymentDate,
          method: data.method,
          reference: data.reference,
          note: data.note,
          receivedByMembershipId: membershipId,
          allocations: {
            create: data.allocations.map(a => ({
              organizationId,
              feeChargeId: a.feeChargeId,
              amount: a.amount,
            })),
          },
        },
        include: { allocations: true },
      });

      return payment as unknown as Payment;
    });
  }

  async voidPayment(organizationId: string, membershipId: string, id: string, data: VoidPaymentDto): Promise<Payment> {
    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id, organizationId } });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.voidedAt) throw new BadRequestException('Payment is already voided');

      const updated = await tx.payment.update({
        where: { id },
        data: {
          voidedAt: new Date(),
          voidedByMembershipId: membershipId,
          voidReason: data.voidReason,
          status: 'VOIDED',
        },
        include: { allocations: true },
      });

      return updated as unknown as Payment;
    });
  }
}
