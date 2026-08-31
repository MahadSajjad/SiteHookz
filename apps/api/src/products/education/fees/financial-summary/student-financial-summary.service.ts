import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service';
import { StudentFinancialSummary, FeeCharge, Payment } from '@sitehookz/education';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class StudentFinancialSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(organizationId: string, studentId: string): Promise<StudentFinancialSummary> {
    const student = await this.prisma.student.findUnique({ where: { id: studentId, organizationId } });
    if (!student) throw new NotFoundException('Student not found');

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { studentId, organizationId },
      select: { id: true },
    });
    const enrollmentIds = enrollments.map(e => e.id);

    const charges = await this.prisma.feeCharge.findMany({
      where: { studentEnrollmentId: { in: enrollmentIds }, organizationId, voidedAt: null },
      include: {
        paymentAllocations: {
          include: { payment: true },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    let totalCharges = new Decimal(0);
    let totalPaid = new Decimal(0);

    for (const charge of charges) {
      totalCharges = totalCharges.plus(charge.amount);
      const chargePaid = charge.paymentAllocations
        .filter(a => !a.payment.voidedAt)
        .reduce((sum, a) => sum.plus(a.amount), new Decimal(0));
      totalPaid = totalPaid.plus(chargePaid);
    }

    const totalOutstanding = totalCharges.minus(totalPaid);

    const payments = await this.prisma.payment.findMany({
      where: { studentId, organizationId, voidedAt: null },
      orderBy: { paymentDate: 'desc' },
      take: 5,
    });

    return {
      studentId,
      totalCharges: totalCharges.toString(),
      totalPaid: totalPaid.toString(),
      totalOutstanding: totalOutstanding.toString(),
      recentCharges: charges.slice(0, 5) as unknown as FeeCharge[],
      recentPayments: payments as unknown as Payment[],
    };
  }
}
