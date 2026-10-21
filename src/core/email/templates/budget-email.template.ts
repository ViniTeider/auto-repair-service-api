import { escapeHtml } from '../../utils/html.util';

export type BudgetEmailData = {
  customerName: string;
  code: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  total: number;
  approveUrl: string;
  denyUrl: string;
};

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value,
  );

const button = (url: string, label: string, color: string) =>
  `<a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;margin:0 8px;background:${color};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">${label}</a>`;

export function budgetEmailTemplate(data: BudgetEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const rows = data.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 12px;">${escapeHtml(item.description)}</td><td style="padding:6px 12px;text-align:center;">${item.quantity}</td><td style="padding:6px 12px;text-align:right;">${money(item.unitPrice)}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="font-family:Arial,Helvetica,sans-serif;color:#222222;">
    <h2>Orçamento da ordem de serviço ${escapeHtml(data.code)}</h2>
    <p>Olá, ${escapeHtml(data.customerName)}! O orçamento do seu veículo está pronto para aprovação.</p>
    <table style="border-collapse:collapse;min-width:360px;">
      <thead><tr><th style="padding:6px 12px;text-align:left;">Item</th><th style="padding:6px 12px;">Qtd.</th><th style="padding:6px 12px;text-align:right;">Valor unit.</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2" style="padding:6px 12px;text-align:right;"><strong>Total</strong></td><td style="padding:6px 12px;text-align:right;"><strong>${money(data.total)}</strong></td></tr></tfoot>
    </table>
    <p style="margin-top:24px;">${button(data.approveUrl, 'Aprovar orçamento', '#2e7d32')}${button(data.denyUrl, 'Negar orçamento', '#c62828')}</p>
  </body>
</html>`;

  const text = [
    `Orçamento da ordem de serviço ${data.code}`,
    ...data.items.map(
      (item) =>
        `- ${item.description} x${item.quantity}: ${money(item.unitPrice)}`,
    ),
    `Total: ${money(data.total)}`,
    `Aprovar: ${data.approveUrl}`,
    `Negar: ${data.denyUrl}`,
  ].join('\n');

  return { subject: `Orçamento da ordem de serviço ${data.code}`, html, text };
}
