/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#BC8B2C", // Amber accent
    paddingBottom: 20,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  brandSub: {
    color: "#BC8B2C",
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  refNo: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#F4F4F4",
    padding: 5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    gap: 20,
  },
  column: {
    flex: 1,
  },
  label: {
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
    paddingVertical: 8,
    alignItems: "center",
  },
  colImage: { width: 40, marginRight: 10 },
  productImage: { width: 40, height: 40, borderRadius: 2, objectFit: "cover" },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colNotes: { flex: 2, marginLeft: 10 },
  productName: { fontWeight: "bold" },
  productCat: { fontSize: 8, color: "#999" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
    textAlign: "center",
    color: "#AAA",
    fontSize: 8,
  },
});

export function RfqPdfTemplate({ rfq }: { rfq: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>
              Virtous<Text style={styles.brandSub}>Uniform</Text>
            </Text>
            <Text style={{ color: "#666" }}>Precision Uniform Solutions</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>Request for Quotation</Text>
            <Text style={styles.refNo}>{rfq.refNo}</Text>
            <Text style={{ textAlign: "right", marginTop: 4 }}>
              {formatDate(rfq.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {/* Customer Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.section}>
              <Text style={styles.label}>Company</Text>
              <Text style={styles.value}>{rfq.companyName}</Text>

              <Text style={styles.label}>Contact Name</Text>
              <Text style={styles.value}>{rfq.contactName}</Text>

              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{rfq.email}</Text>

              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{rfq.phone}</Text>

              <Text style={styles.label}>Country</Text>
              <Text style={styles.value}>{rfq.country}</Text>
            </View>
          </View>

          {/* RFQ Summary */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>RFQ Summary</Text>
            <View style={styles.section}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: "#BC8B2C" }]}>{rfq.status}</Text>

              <Text style={styles.label}>Total Est. Quantity</Text>
              <Text style={styles.value}>{rfq.quantity}</Text>

              <Text style={styles.label}>Preferred Contact</Text>
              <Text style={styles.value}>{rfq.preferredContactMethod}</Text>

              {rfq.user && (
                <>
                  <Text style={styles.label}>Account ID</Text>
                  <Text style={styles.value}>{rfq.user.id}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Requirements */}
        {rfq.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements & Message</Text>
            <Text style={{ lineHeight: 1.5, color: "#444" }}>{rfq.requirements}</Text>
          </View>
        )}

        {/* Product Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requested Products</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colImage} />
              <Text style={styles.colProduct}>Product</Text>
              <Text style={styles.colNotes}>Configuration / Notes</Text>
              <Text style={styles.colQty}>Quantity</Text>
            </View>

            {rfq.items.map((item: any) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.colImage}>
                  {item.product?.images?.[0]?.url && (
                    <Image src={item.product.images[0].url} style={styles.productImage} />
                  )}
                </View>
                <View style={styles.colProduct}>
                  <Text style={styles.productName}>
                    {item.product?.name || "Custom Item"}
                  </Text>
                  {item.product?.category && (
                    <Text style={styles.productCat}>{item.product.category.name}</Text>
                  )}
                  {item.product?.sku && (
                    <Text style={{ fontSize: 7, color: "#999" }}>SKU: {item.product.sku}</Text>
                  )}
                </View>
                <View style={styles.colNotes}>
                  <Text>{item.notes || "-"}</Text>
                </View>
                <Text style={styles.colQty}>{item.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is an automatically generated document from Virtous Uniform Platform.
          Internal Admin Copy — Confidential.
        </Text>
      </Page>
    </Document>
  );
}
