import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Account extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0, default: 0 })
  amount: number;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ required: true })
  period: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
AccountSchema.index({ userId: 1, period: 1 });
