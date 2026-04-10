import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Credit } from './schemas/credit.schema';
import { CreateCreditDto, UpdateCreditDto } from './dto/credit.dto';

@Injectable()
export class CreditsService {
  constructor(@InjectModel(Credit.name) private model: Model<Credit>) {}

  async create(userId: string, dto: CreateCreditDto) {
    return this.model.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findByPeriod(userId: string, period: string) {
    return this.model.find({ userId: new Types.ObjectId(userId), period }).sort({ location: 1 });
  }

  async getSummary(userId: string, period: string) {
    const result = await this.model.aggregate([
      { $match: { userId: new Types.ObjectId(userId), period } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    return result[0] || { totalAmount: 0, count: 0 };
  }

  async update(userId: string, id: string, dto: UpdateCreditDto) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Credito no encontrado');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(userId: string, id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Credito no encontrado');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    await doc.deleteOne();
    return { message: 'Credito eliminado' };
  }
}
