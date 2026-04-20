import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";

const colors = {
  navy: "#1a365d",
  navyLight: "#2c5282",
  anthracite: "#2d3748",
  muted: "#718096",
  border: "#e2e8f0",
  surface: "#f7fafc",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingHorizontal: 48,
    paddingBottom: 72,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.anthracite,
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  brandBlock: {
    flexDirection: "column",
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    letterSpacing: 0.5,
  },
  brandAccent: {
    width: 40,
    height: 3,
    backgroundColor: colors.navyLight,
    marginTop: 6,
  },
  brandTag: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  headerMeta: {
    fontSize: 8,
    color: colors.muted,
    textAlign: "right",
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 6,
    lineHeight: 1.35,
  },
  subtitle: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 24,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionBody: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 9.5,
    color: colors.anthracite,
    paddingRight: 12,
  },
  rowValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    textAlign: "right",
    maxWidth: "42%",
  },
  rowValueMuted: {
    fontFamily: "Helvetica",
    color: colors.muted,
    fontSize: 8.5,
  },
  legalFooter: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 7.5,
    color: colors.muted,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
});

export type BankReportData = {
  projectName: string;
  generatedAtLabel: string;
  synthese: {
    prixAchat: string;
    travaux: string;
    fraisNotaire: string;
    coutTotalProjet: string;
  };
  financement: {
    apport: string;
    montantEmprunt: string;
    mensualite: string;
    taux: string;
    duree: string;
  };
  performance: {
    loyer: string;
    charges: string;
    cashflow: string;
    rendementNet: string;
  };
};

function Row({
  label,
  value,
  isLast,
  valueMuted,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  valueMuted?: boolean;
}) {
  return (
    <View style={isLast ? [styles.row, styles.rowLast] : styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={
          valueMuted ? [styles.rowValue, styles.rowValueMuted] : styles.rowValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

export function BankReport({ data }: { data: BankReportData }) {
  const safeName = data.projectName.trim() || "Projet";

  return (
    <Document
      title={`Dossier de financement — ${safeName}`}
      author="InvestFlow"
      subject="Dossier bancaire immobilier"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>InvestFlow</Text>
            <View style={styles.brandAccent} />
            <Text style={styles.brandTag}>Analyse et financement</Text>
          </View>
          <View>
            <Text style={styles.headerMeta}>{data.generatedAtLabel}</Text>
          </View>
        </View>

        <View style={styles.rule} />

        <Text style={styles.title}>
          Dossier de Financement Immobilier - {safeName}
        </Text>
        <Text style={styles.subtitle}>
          Synthèse des hypothèses saisies dans le simulateur InvestFlow.
          Les montants sont présentés selon les règles de calcul du module
          (notaire 8 %, vacance 5 %).
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synthèse du projet</Text>
          <View style={styles.sectionBody}>
            <Row
              label={"Prix d\u2019achat (net vendeur)"}
              value={data.synthese.prixAchat}
            />
            <Row label="Budget travaux" value={data.synthese.travaux} />
            <Row
              label={"Frais de notaire (estim. 8 %)"}
              value={data.synthese.fraisNotaire}
            />
            <Row
              label="Coût total du projet"
              value={data.synthese.coutTotalProjet}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan de financement</Text>
          <View style={styles.sectionBody}>
            <Row label="Apport personnel" value={data.financement.apport} />
            <Row
              label="Montant à emprunter"
              value={data.financement.montantEmprunt}
            />
            <Row label="Mensualité de crédit" value={data.financement.mensualite} />
            <Row
              label={"Taux d\u2019intérêt (annuel)"}
              value={data.financement.taux}
            />
            <Row label="Durée du prêt" value={data.financement.duree} isLast />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance locative</Text>
          <View style={styles.sectionBody}>
            <Row
              label="Loyer mensuel (hors charges locataire)"
              value={data.performance.loyer}
            />
            <Row
              label={"Charges mensuelles (taxe, copro, vacance 5 %)"}
              value={data.performance.charges}
            />
            <Row label="Cash-flow mensuel" value={data.performance.cashflow} />
            <Row
              label="Rendement net (sur coût total projet)"
              value={data.performance.rendementNet}
              isLast
            />
          </View>
        </View>

        <Text style={styles.legalFooter} fixed>
          Document généré par InvestFlow - Simulation à titre indicatif
        </Text>
      </Page>
    </Document>
  );
}

export async function generateBankReportPdfBlob(data: BankReportData) {
  return pdf(<BankReport data={data} />).toBlob();
}
