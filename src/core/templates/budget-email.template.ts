import { formatCurrency } from '../utils/currency.util';
import { escapeHtml } from '../utils/html.util';

export type BudgetEmailData = {
  customerName: string;
  code: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  total: number;
  budgetUrl: string;
};

export function budgetEmailTemplate(data: BudgetEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const rows = data.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 12px;">${escapeHtml(item.description)}</td><td style="padding:6px 12px;text-align:center;">${item.quantity}</td><td style="padding:6px 12px;text-align:right;">${formatCurrency(item.unitPrice)}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="font-family:Arial,Helvetica,sans-serif;color:#222222;">
    <h2>Orçamento da ordem de serviço ${escapeHtml(data.code)}</h2>
    <p>Olá, ${escapeHtml(data.customerName)}! O orçamento do seu veículo está pronto.</p>
    <table style="border-collapse:collapse;min-width:360px;">
      <thead><tr><th style="padding:6px 12px;text-align:left;">Item</th><th style="padding:6px 12px;">Qtd.</th><th style="padding:6px 12px;text-align:right;">Valor unit.</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2" style="padding:6px 12px;text-align:right;"><strong>Total</strong></td><td style="padding:6px 12px;text-align:right;"><strong>${formatCurrency(data.total)}</strong></td></tr></tfoot>
    </table>
    <p style="margin-top:24px;"><a href="${escapeHtml(data.budgetUrl)}" style="display:inline-block;padding:12px 24px;background:#1565c0;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Ver orçamento e responder</a></p>
  </body>
</html>`;

  const text = [
    `Orçamento da ordem de serviço ${data.code}`,
    ...data.items.map(
      (item) =>
        `- ${item.description} x${item.quantity}: ${formatCurrency(item.unitPrice)}`,
    ),
    `Total: ${formatCurrency(data.total)}`,
    `Ver orçamento e responder: ${data.budgetUrl}`,
  ].join('\n');

  return { subject: `Orçamento da ordem de serviço ${data.code}`, html, text };
}
