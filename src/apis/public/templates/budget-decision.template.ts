import { WorkOrderBudgetDto } from '../../../core/dtos/work-order/work-order-response.dto';
import { BudgetStatusEnum } from '../../../core/enums/work-order/budget-status.enum';
import { WorkOrderStatusEnum } from '../../../core/enums/work-order/work-order-status.enum';
import { escapeHtml } from '../../../core/utils/html.util';

export type BudgetDecision = 'approve' | 'deny';

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value,
  );

const page = (title: string, body: string) => `<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
  <body style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:32px auto;padding:0 16px;color:#222222;">
    ${body}
  </body>
</html>`;

const decisionButton = (
  code: string,
  decision: BudgetDecision,
  label: string,
  color: string,
) =>
  `<form method="post" action="/public/work-order/${encodeURIComponent(code)}/${decision}" style="display:inline-block;margin:0 8px;">
      <button type="submit" style="padding:12px 24px;background:${color};color:#ffffff;border:0;border-radius:6px;font-weight:bold;font-size:16px;cursor:pointer;">${label}</button>
    </form>`;

// Opening the link from the email only shows this page; the decision is made by the POST of one of its
// forms, so link scanners and prefetchers cannot approve or deny a budget by accident.
export function budgetPage(budget: WorkOrderBudgetDto): string {
  const rows = budget.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 8px;">${escapeHtml(item.description)}</td><td style="padding:6px 8px;text-align:center;">${item.quantity}</td><td style="padding:6px 8px;text-align:right;">${money(item.unitPrice)}</td><td style="padding:6px 8px;text-align:right;">${money(item.unitPrice * item.quantity)}</td></tr>`,
    )
    .join('');
  const awaitingDecision =
    budget.status === WorkOrderStatusEnum.AWAITING_APPROVAL &&
    budget.budgetStatus === BudgetStatusEnum.PENDING;
  const decision = awaitingDecision
    ? `<p style="text-align:center;margin-top:24px;">${decisionButton(budget.code, 'approve', 'Aprovar orçamento', '#2e7d32')}${decisionButton(budget.code, 'deny', 'Negar orçamento', '#c62828')}</p>`
    : `<p style="text-align:center;margin-top:24px;color:#555555;">Este orçamento não está aguardando uma resposta (situação atual: ${escapeHtml(budget.status)}).</p>`;

  return page(
    'Orçamento',
    `<h2>Orçamento da ordem de serviço ${escapeHtml(budget.code)}</h2>
    <p><strong>Veículo:</strong> ${escapeHtml(budget.vehicle.make)} ${escapeHtml(budget.vehicle.model)} ${budget.vehicle.year} · placa ${escapeHtml(budget.vehicle.licensePlate)}<br>
    <strong>Aberta em:</strong> ${budget.createdAt.toLocaleDateString('pt-BR')}</p>
    <table style="border-collapse:collapse;width:100%;">
      <thead><tr><th style="padding:6px 8px;text-align:left;">Item</th><th style="padding:6px 8px;">Qtd.</th><th style="padding:6px 8px;text-align:right;">Valor unit.</th><th style="padding:6px 8px;text-align:right;">Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3" style="padding:8px;text-align:right;"><strong>Total</strong></td><td style="padding:8px;text-align:right;"><strong>${money(budget.total)}</strong></td></tr></tfoot>
    </table>
    ${decision}`,
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
