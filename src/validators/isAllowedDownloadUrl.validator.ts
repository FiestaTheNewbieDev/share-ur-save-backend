import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import ALLOWED_HOSTS from 'src/misc/allowedHosts';

@ValidatorConstraint({ name: 'allowedDownloadUrl', async: false })
export class IsAllowedDownloadUrl implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      return Object.values(ALLOWED_HOSTS).some(
        (AllowedHost) =>
          AllowedHost.domain && hostname.endsWith(AllowedHost.domain),
      );
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid Download URL';
  }
}
