import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionType } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.transactionModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async findByPeriod(userId: string, period: string, type?: TransactionType) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      period,
    };
    if (type) {
      filter.type = type;
    }
    return this.transactionModel.find(filter).sort({ dueDate: 1 });
  }

  async getSummary(userId: string, period: string) {
    const objectId = new Types.ObjectId(userId);

    const [income, expenses] = await Promise.all([
      this.transactionModel.aggregate([
        { $match: { userId: objectId, period, type: TransactionType.INCOME } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            totalPaid: {
              $sum: { $cond: ['$isPaid', '$amount', 0] },
            },
            totalPending: {
              $sum: { $cond: ['$isPaid', 0, '$amount'] },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      this.transactionModel.aggregate([
        { $match: { userId: objectId, period, type: TransactionType.EXPENSE } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            totalPaid: {
              $sum: { $cond: ['$isPaid', '$amount', 0] },
            },
            totalPending: {
              $sum: { $cond: ['$isPaid', 0, '$amount'] },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const incomeData = income[0] || { total: 0, totalPaid: 0, totalPending: 0, count: 0 };
    const expenseData = expenses[0] || { total: 0, totalPaid: 0, totalPending: 0, count: 0 };

    return {
      income: incomeData,
      expenses: expenseData,
      balance: incomeData.total - expenseData.total,
      balancePaid: incomeData.totalPaid - expenseData.totalPaid,
    };
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.transactionModel.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transaccion no encontrada');
    }

    if (transaction.userId.toString() !== userId) {
      throw new ForbiddenException('No tienes acceso a esta transaccion');
    }

    Object.assign(transaction, dto);
    return transaction.save();
  }

  async togglePaid(userId: string, id: string) {
    const transaction = await this.transactionModel.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transaccion no encontrada');
    }

    if (transaction.userId.toString() !== userId) {
      throw new ForbiddenException('No tienes acceso a esta transaccion');
    }

    transaction.isPaid = !transaction.isPaid;
    transaction.paidDate = transaction.isPaid ? new Date() : null;
    return transaction.save();
  }

  async generateRecurring(userId: string, period: string) {
    const objectId = new Types.ObjectId(userId);

    // Find what recurring transactions already exist for this period
    const existingRecurring = await this.transactionModel
      .find({ userId: objectId, period, isRecurring: true })
      .lean();

    const existingKeys = new Set(existingRecurring.map((t) => `${t.type}-${t.source}`));

    // Find recurring transactions from previous periods (not the target period)
    const previousRecurring = await this.transactionModel
      .find({ userId: objectId, isRecurring: true, period: { $ne: period } })
      .sort({ period: -1 })
      .lean();

    // Get unique by source+type from the latest period, skip already existing
    const seen = new Set<string>();
    const toGenerate: typeof previousRecurring = [];
    for (const t of previousRecurring) {
      const key = `${t.type}-${t.source}`;
      if (!seen.has(key) && !existingKeys.has(key)) {
        seen.add(key);
        toGenerate.push(t);
      }
    }

    if (toGenerate.length === 0) {
      return { generated: 0, message: 'No hay transacciones recurrentes nuevas para generar' };
    }

    // Parse the target period to build new dueDate
    const [year, month] = period.split('-').map(Number);

    const newTransactions = toGenerate.map((t) => {
      const oldDate = new Date(t.dueDate);
      const day = Math.min(oldDate.getDate(), new Date(year, month, 0).getDate());
      const newDueDate = new Date(year, month - 1, day);

      return {
        userId: objectId,
        type: t.type,
        source: t.source,
        amount: t.amount,
        isPaid: false,
        isRecurring: true,
        dueDate: newDueDate,
        paidDate: null,
        period,
        notes: t.notes,
      };
    });

    await this.transactionModel.insertMany(newTransactions);
    return { generated: newTransactions.length, message: `${newTransactions.length} transacciones recurrentes generadas` };
  }

  async remove(userId: string, id: string) {
    const transaction = await this.transactionModel.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transaccion no encontrada');
    }

    if (transaction.userId.toString() !== userId) {
      throw new ForbiddenException('No tienes acceso a esta transaccion');
    }

    await transaction.deleteOne();
    return { message: 'Transaccion eliminada' };
  }
}
