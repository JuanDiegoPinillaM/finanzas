import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true, trim: true })
  source: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: Date, default: null })
  paidDate: Date | null;

  @Prop({ required: true })
  period: string; // format: "YYYY-MM"

  @Prop({ type: String, default: null })
  notes: string | null;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ userId: 1, period: 1, type: 1 });
