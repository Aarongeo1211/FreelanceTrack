
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    const updatedPayments = await db.payment.updateMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: now
        }
      },
      data: {
        status: 'OVERDUE'
      }
    });

    return NextResponse.json({
      message: `Updated ${updatedPayments.count} payments to OVERDUE.`,
      count: updatedPayments.count
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
