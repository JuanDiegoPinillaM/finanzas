import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll() {
    return this.userModel.find().select('-password -emailConfirmationToken -resetPasswordToken -resetPasswordExpires');
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -emailConfirmationToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async getProfile(userId: string) {
    return this.findById(userId);
  }
}
