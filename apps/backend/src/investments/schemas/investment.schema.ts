import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InvestmentType {
  CDT = 'cdt',
  CURRENCY = 'currency',
}

@Schema({ timestamps: true })
export class Investment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: InvestmentType })
  type: InvestmentType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  value: number;

  // CDT fields
  @Prop({ type: Number, default: null })
  monthlyReturn: number | null;

  @Prop({ type: Number, default: null })
  annualReturn: number | null;

  // Currency fields
  @Prop({ type: Number, default: null })
  valueCOP: number | null;

  @Prop({ type: Number, default: null })
  exchangeRate: number | null;

  @Prop({ required: true })
  period: string;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
InvestmentSchema.index({ userId: 1, period: 1, type: 1 });
