import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  messageKey: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly messages = signal<readonly ToastMessage[]>([]);

  success(messageKey: string): void {
    this.show('success', messageKey);
  }

  error(messageKey: string): void {
    this.show('error', messageKey);
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private show(kind: ToastKind, messageKey: string): void {
    const id = this.nextId++;
    this.messages.update((messages) => [...messages, { id, kind, messageKey }]);
    window.setTimeout(() => this.dismiss(id), 4500);
  }
}
