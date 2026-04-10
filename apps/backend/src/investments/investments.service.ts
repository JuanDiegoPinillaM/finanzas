import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Investment, InvestmentType } from './schemas/investment.schema';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto/investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(@InjectModel(Investment.name) private model: Model<Investment>) {}

  async create(userId: string, dto: CreateInvestmentDto) {
    return this.model.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findByPeriod(userId: string, period: string, type?: InvestmentType) {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId), period };
    if (type) filter.type = type;
    return this.model.find(filter).sort({ name: 1 });
  }

  async getSummary(userId: string, period: string) {
    const objectId = new Types.ObjectId(userId);
    const [cdts, currencies] = await Promise.all([
      this.model.aggregate([
        { $match: { userId: objectId, period, type: InvestmentType.CDT } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$value' },
            totalMonthlyReturn: { $sum: '$monthlyReturn' },
            totalAnnualReturn: { $sum: '$annualReturn' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.model.aggregate([
        { $match: { userId: objectId, period, type: InvestmentType.CURRENCY } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$value' },
            totalValueCOP: { $sum: '$valueCOP' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
    return {
      cdts: cdts[0] || { totalValue: 0, totalMonthlyReturn: 0, totalAnnualReturn: 0, count: 0 },
      currencies: currencies[0] || { totalValue: 0, totalValueCOP: 0, count: 0 },
    };
  }

  async update(userId: string, id: string, dto: UpdateInvestmentDto) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Inversion no encontrada');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(userId: string, id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Inversion no encontrada');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    await doc.deleteOne();
    return { message: 'Inversion eliminada' };
  }
}
