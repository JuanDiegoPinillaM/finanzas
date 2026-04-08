import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { MailService } from './mail.service';
import { ROLE_PERMISSIONS } from '../common/enums/permission.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
      emailConfirmationToken,
      permissions: ROLE_PERMISSIONS['user'],
    });

    // Fire-and-forget: no bloquear la respuesta por el envío de correo
    this.mailService
      .sendConfirmationEmail(user.email, emailConfirmationToken)
      .catch((err) => this.logger.error(`Error enviando email de confirmación: ${err.message}`));

    return {
      message:
        'Registro exitoso. Revisa tu correo para confirmar tu cuenta.',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException(
        'Debes confirmar tu correo electrónico antes de iniciar sesión',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta está desactivada');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  async confirmEmail(token: string) {
    const user = await this.userModel.findOne({
      emailConfirmationToken: token,
    });

    if (!user) {
      throw new BadRequestException(
        'Token de confirmación inválido o expirado',
      );
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = null;
    await user.save();

    return { message: 'Correo confirmado exitosamente. Ya puedes iniciar sesión.' };
  }

  async requestResetPassword(dto: RequestResetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) {
      // No revelar si el correo existe o no
      return {
        message:
          'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    this.mailService
      .sendResetPasswordEmail(user.email, resetToken)
      .catch((err) => this.logger.error(`Error enviando email de reset: ${err.message}`));

    return {
      message:
        'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: dto.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException(
        'Token inválido o expirado. Solicita un nuevo enlace.',
      );
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Contraseña restablecida exitosamente.' };
  }

  async resendConfirmationEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user || user.isEmailConfirmed) {
      return { message: 'Si el correo requiere confirmación, se ha enviado un nuevo enlace.' };
    }

    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
    user.emailConfirmationToken = emailConfirmationToken;
    await user.save();

    this.mailService
      .sendConfirmationEmail(user.email, emailConfirmationToken)
      .catch((err) => this.logger.error(`Error reenviando email de confirmación: ${err.message}`));

    return { message: 'Si el correo requiere confirmación, se ha enviado un nuevo enlace.' };
  }
}
