import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Credit extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true })
  period: string;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
CreditSchema.index({ userId: 1, period: 1 });
