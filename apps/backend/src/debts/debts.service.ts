import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Debt, DebtType } from './schemas/debt.schema';
import { CreateDebtDto, UpdateDebtDto } from './dto/debt.dto';

@Injectable()
export class DebtsService {
  constructor(@InjectModel(Debt.name) private model: Model<Debt>) {}

  async create(userId: string, dto: CreateDebtDto) {
    return this.model.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findByPeriod(userId: string, period: string, type?: DebtType) {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId), period };
    if (type) filter.type = type;
    return this.model.find(filter).sort({ name: 1 });
  }

  async getSummary(userId: string, period: string) {
    const objectId = new Types.ObjectId(userId);
    const [debtors, creditors] = await Promise.all([
      this.model.aggregate([
        { $match: { userId: objectId, period, type: DebtType.DEBTOR } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.model.aggregate([
        { $match: { userId: objectId, period, type: DebtType.CREDITOR } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);
    return {
      debtors: debtors[0] || { total: 0, count: 0 },
      creditors: creditors[0] || { total: 0, count: 0 },
    };
  }

  async update(userId: string, id: string, dto: UpdateDebtDto) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Registro no encontrado');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(userId: string, id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Registro no encontrado');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    await doc.deleteOne();
    return { message: 'Registro eliminado' };
  }
}
