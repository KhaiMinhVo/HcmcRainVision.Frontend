/**
 * Auth API: login, register, me, forgot-password, reset-password, updateProfile, changePassword
 */
import { apiPost, apiGet, apiPut } from './apiClient';
import type {
  LoginDto,
  LoginResponse,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
  UserProfileDto,
} from '../types/api';

export async function login(body: LoginDto): Promise<LoginResponse> {
  return apiPost<LoginResponse>('api/auth/login', body);
}

export async function register(body: RegisterDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/auth/register', body);
}

export async function getMe(): Promise<UserProfileDto> {
  return apiGet<UserProfileDto>('api/auth/me');
}

export async function forgotPassword(body: ForgotPasswordDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/auth/forgot-password', body);
}

export async function resetPassword(body: ResetPasswordDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/auth/reset-password', body);
}

export async function updateProfile(body: UpdateProfileDto): Promise<{ message: string }> {
  return apiPut<{ message: string }>('api/auth/me', body);
}

export async function changePassword(body: ChangePasswordDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/auth/change-password', body);
}
