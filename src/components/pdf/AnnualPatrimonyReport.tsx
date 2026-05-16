import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { PortfolioConsolidated } from "@/lib/portfolio/consolidated";
import type { AccountingYearSummary } from "@/lib/portfolio/accounting";

const colors = {
  navy: "#1a365d",
  muted: "#718096",
  border: "#e2e8f0",
  surface: "#f7fafc",
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#2d3748",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 4,
  },
  subtitle: { fontSize: 9, color: colors.muted, marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.muted },
  rowValue: { fontFamily: "Helvetica-Bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    fontSize: 8,
  },
  colDate: { width: "18%" },
  colProject: { width: "22%" },
  colLabel: { width: "35%" },
  colAmount: { width: "25%", textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 7,
    color: colors.muted,
    textAlign: "center",
  },
});

export type AnnualPatrimonyReportData = {
  year: number;
  generatedAtLabel: string;
  consolidated: PortfolioConsolidated;
  accounting: AccountingYearSummary;
  annualSalary: number | null;
  debtToIncomePct: number | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function AnnualPatrimonyReportDocument({ data }: { data: AnnualPatrimonyReportData }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rapport annuel patrimonial</Text>
        <Text style={styles.subtitle}>
          Exercice {data.year} — généré le {data.generatedAtLabel} — InvestFlow
        </Text>

        <Text style={styles.sectionTitle}>Vue consolidée du portefeuille</Text>
        <Row label="Nombre de biens" value={String(data.consolidated.propertyCount)} />
        <Row label="Valeur totale estimée" value={fmt(data.consolidated.valeurTotale)} />
        <Row label="Dette totale (encours)" value={fmt(data.consolidated.detteTotale)} />
        <Row label="Patrimoine net estimé" value={fmt(data.consolidated.patrimoineNet)} />
        <Row
          label="Cash-flow mensuel total"
          value={fmt(data.consolidated.cashflowMensuelTotal)}
        />
        <Row
          label="Cash-flow annuel total"
          value={fmt(data.consolidated.cashflowAnnuelTotal)}
        />

        <Text style={styles.sectionTitle}>Préparation comptable ({data.year})</Text>
        <Row label="Revenus enregistrés" value={fmt(data.accounting.revenus)} />
        <Row label="Dépenses enregistrées" value={fmt(data.accounting.depenses)} />
        <Row label="Solde annuel" value={fmt(data.accounting.solde)} />

        {data.accounting.lines.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
              Détail des mouvements
            </Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colDate}>Date</Text>
              <Text style={styles.colProject}>Projet</Text>
              <Text style={styles.colLabel}>Libellé</Text>
              <Text style={styles.colAmount}>Montant</Text>
            </View>
            {data.accounting.lines.slice(0, 40).map((line) => (
              <View key={String(line.id)} style={styles.tableRow}>
                <Text style={styles.colDate}>{line.occurred_on}</Text>
                <Text style={styles.colProject}>{line.property_name}</Text>
                <Text style={styles.colLabel}>{line.label}</Text>
                <Text style={styles.colAmount}>{fmt(line.amount)}</Text>
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Endettement</Text>
        <Row
          label="Salaire annuel déclaré"
          value={data.annualSalary != null ? fmt(data.annualSalary) : "Non renseigné"}
        />
        <Row
          label="Charges de crédit annuelles estimées"
          value={fmt(data.consolidated.chargesCreditAnnuelles)}
        />
        <Row
          label="Taux d'endettement estimé"
          value={
            data.debtToIncomePct != null
              ? `${data.debtToIncomePct.toFixed(1)} %`
              : "Renseignez votre salaire dans le profil"
          }
        />

        <Text style={styles.footer} fixed>
          Document généré par InvestFlow — Données indicatives, non substituables à un
          bilan comptable certifié.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateAnnualPatrimonyReportPdfBlob(
  data: AnnualPatrimonyReportData
) {
  return pdf(<AnnualPatrimonyReportDocument data={data} />).toBlob();
}
