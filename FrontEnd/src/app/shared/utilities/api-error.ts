import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorTranslationKey(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'errors.unexpected';
  }

  if (error.status === 0) {
    return 'errors.network';
  }

  if (error.status === 400) {
    return 'errors.badRequest';
  }

  if (error.status === 404) {
    return 'errors.notFound';
  }

  if (error.status === 409) {
    return 'errors.conflict';
  }

  return 'errors.server';
}
