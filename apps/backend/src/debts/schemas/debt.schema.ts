import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum DebtType {
  DEBTOR = 'debtor',   // me deben
  CREDITOR = 'creditor', // yo debo
}

@Schema({ timestamps: true })
export class Debt extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: DebtType })
  type: DebtType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({ required: true })
  period: string;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
DebtSchema.index({ userId: 1, period: 1, type: 1 });
