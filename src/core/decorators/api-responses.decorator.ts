import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

type Description = true | string;

type ApiResponsesOptions = {
  success: { status: HttpStatus; description: string };
  badRequest?: Description;
  unauthorized?: Description;
  notFound?: Description;
  conflict?: Description;
  unprocessable?: Description;
};

const ERRORS: {
  key: Exclude<keyof ApiResponsesOptions, 'success'>;
  status: HttpStatus;
  description: string;
}[] = [
  {
    key: 'badRequest',
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  },
  {
    key: 'unauthorized',
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid bearer token',
  },
  {
    key: 'notFound',
    status: HttpStatus.NOT_FOUND,
    description: 'Resource not found',
  },
  {
    key: 'conflict',
    status: HttpStatus.CONFLICT,
    description: 'Conflict with the current state of a resource',
  },
  {
    key: 'unprocessable',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Business rule violation',
  },
];

export const ApiResponses = (options: ApiResponsesOptions) =>
  applyDecorators(
    ApiResponse(options.success),
    ...ERRORS.flatMap(({ key, status, description }) => {
      const value = options[key];
      return value
        ? [
            ApiResponse({
              status,
              description: value === true ? description : value,
            }),
          ]
        : [];
    }),
  );
