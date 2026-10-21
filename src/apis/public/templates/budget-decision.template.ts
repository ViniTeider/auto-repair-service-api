import { escapeHtml } from '../../../core/utils/html.util';

export type BudgetDecision = 'approve' | 'deny';

const LABELS: Record<
  BudgetDecision,
  { question: string; button: string; color: string }
> = {
  approve: {
    question: 'Deseja aprovar o orçamento',
    button: 'Confirmar aprovação',
    color: '#2e7d32',
  },
  deny: {
    question: 'Deseja negar o orçamento',
    button: 'Confirmar negação',
    color: '#c62828',
  },
};

const page = (title: string, body: string) => `<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
  <body style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:48px auto;padding:0 16px;color:#222222;text-align:center;">
    ${body}
  </body>
</html>`;

// Opening the link from the email only shows this page; the decision is made by the POST of the form,
// so link scanners and prefetchers cannot approve or deny a budget by accident.
export function budgetConfirmationPage(
  code: string,
  decision: BudgetDecision,
): string {
  const label = LABELS[decision];
  return page(
    'Confirmar orçamento',
    `<h2>Ordem de serviço ${escapeHtml(code)}</h2>
    <p>${label.question}?</p>
    <form method="post" action="/public/work-order/${encodeURIComponent(code)}/${decision}">
      <button type="submit" style="padding:12px 24px;background:${label.color};color:#ffffff;border:0;border-radius:6px;font-weight:bold;font-size:16px;cursor:pointer;">${label.button}</button>
    </form>`,
  );
}

export function budgetResultPage(
  code: string,
  decision: BudgetDecision,
): string {
  const message =
    decision === 'approve'
      ? 'Orçamento aprovado. A execução do serviço será iniciada.'
      : 'Orçamento negado. A oficina entrará em contato.';
  return page(
    'Orçamento',
    `<h2>Ordem de serviço ${escapeHtml(code)}</h2><p>${message}</p>`,
  );
}

export function budgetErrorPage(message: string): string {
  return page(
    'Orçamento',
    `<h2>Não foi possível concluir</h2><p>${escapeHtml(message)}</p>`,
  );
}
