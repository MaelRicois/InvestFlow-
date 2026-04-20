export type DashboardPropertyRow = {
  id: number;
  name: string | null;
  purchase_price: number | string | null;
  renovation_cost: number | string | null;
  monthly_rent: number | string | null;
  tax_monthly: number | string | null;
  charges_monthly: number | string | null;
  monthly_cashflow: number | string | null;
  net_yield: number | string | null;
  credit_type?: string | null;
  city?: string | null;
};
