import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account } from './schemas/account.schema';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(@InjectModel(Account.name) private model: Model<Account>) {}

  async create(userId: string, dto: CreateAccountDto) {
    return this.model.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findByPeriod(userId: string, period: string) {
    return this.model.find({ userId: new Types.ObjectId(userId), period }).sort({ name: 1 });
  }

  async getSummary(userId: string, period: string) {
    const result = await this.model.aggregate([
      { $match: { userId: new Types.ObjectId(userId), period } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return result[0] || { total: 0, count: 0 };
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Cuenta no encontrada');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    Object.assign(doc, dto);
    return doc.save();
  }

  async generateRecurring(userId: string, period: string) {
    const objectId = new Types.ObjectId(userId);

    const existingRecurring = await this.model
      .find({ userId: objectId, period, isRecurring: true })
      .lean();

    const existingKeys = new Set(existingRecurring.map((a) => a.name));

    const previousRecurring = await this.model
      .find({ userId: objectId, isRecurring: true, period: { $ne: period } })
      .sort({ period: -1 })
      .lean();

    const seen = new Set<string>();
    const toGenerate: typeof previousRecurring = [];
    for (const a of previousRecurring) {
      if (!seen.has(a.name) && !existingKeys.has(a.name)) {
        seen.add(a.name);
        toGenerate.push(a);
      }
    }

    if (toGenerate.length === 0) {
      return { generated: 0, message: 'No hay cuentas recurrentes nuevas para generar' };
    }

    const newAccounts = toGenerate.map((a) => ({
      userId: objectId,
      name: a.name,
      amount: a.amount,
      isRecurring: true,
      period,
    }));

    await this.model.insertMany(newAccounts);
    return { generated: newAccounts.length, message: `${newAccounts.length} cuentas recurrentes generadas` };
  }

  async remove(userId: string, id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Cuenta no encontrada');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    await doc.deleteOne();
    return { message: 'Cuenta eliminada' };
  }
}
