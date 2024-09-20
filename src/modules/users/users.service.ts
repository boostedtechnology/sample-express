import { AppError } from '../../framework';
import { ICreateUser } from './users.schemas';
import { ICreateUserResultSchema } from './users.schemas';

export const createUser = async (user: ICreateUser): Promise<ICreateUserResultSchema> => {
  if (user.first_name === 'Adam') {
    throw new AppError(400, 'Sending custom error', { errorCode: 'NAME_NOT_ALLOWED' });
  }

  if (user.first_name === 'Joe') {
    throw new Error('Sending random error');
  }

  console.log(user);

  return { result: true };
};
