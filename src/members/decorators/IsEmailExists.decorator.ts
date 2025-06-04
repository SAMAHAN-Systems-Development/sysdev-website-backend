import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { eq, and, isNull } from 'drizzle-orm';
import { members } from 'drizzle/schema';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
export function IsEmailExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsCategoryIdExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistsConstraints,
    });
  };
}

@ValidatorConstraint({ name: 'IsEmailExists', async: true })
@Injectable()
class IsEmailExistsConstraints implements ValidatorConstraintInterface {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async validate(email: string): Promise<boolean> {
    const member = await this.db
      .select()
      .from(members)
      .where(and(eq(members.email, email), isNull(members.deletedAt)));

    return member.length === 0;
  }

  defaultMessage(): string {
    return 'Email already exists';
  }
}
