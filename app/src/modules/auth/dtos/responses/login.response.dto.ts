export class AdminSummaryDto {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export class LoginResponseDto {
  accessToken: string;
  admin: AdminSummaryDto;
}
