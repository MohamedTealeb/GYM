export class GenerateOtp {
    private static readonly OTP_LENGTH = 6;
    private static readonly OTP_EXPIRY_MINUTES = 5;
  
    static generate(): string {
      const min = Math.pow(10, this.OTP_LENGTH - 1);
      const max = Math.pow(10, this.OTP_LENGTH) - 1;
  
      return Math.floor(min + Math.random() * (max - min)).toString();
    }
  
    static getExpiryDate(): Date {
      return new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
    }
  }