/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

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
    marginBottom: 30,
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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    textTransform: "uppercase",
  },
  catalogYear: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  productCard: {
    width: "47%", // roughly 2 columns
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 10,
    borderRadius: 4,
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F9F9F9",
    marginBottom: 10,
    objectFit: "cover",
  },
  categoryLabel: {
    fontSize: 7,
    color: "#BC8B2C",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.4,
    marginBottom: 8,
  },
  specRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  specLabel: {
    fontSize: 7,
    fontWeight: "bold",
    width: 60,
  },
  specValue: {
    fontSize: 7,
    color: "#444",
    flex: 1,
  },
  rfqTag: {
    marginTop: 10,
    padding: 4,
    backgroundColor: "#222",
    color: "#FFF",
    fontSize: 8,
    textAlign: "center",
    fontWeight: "bold",
    borderRadius: 2,
  },
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

export function CataloguePdfTemplate({ products }: { products: any[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover-style Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>
              Gloves<Text style={styles.brandSub}>Mfg</Text>
            </Text>
            <Text style={{ color: "#666" }}>Precision Industrial Quality</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>Product Catalogue</Text>
            <Text style={styles.catalogYear}>Full Collection 2026</Text>
          </View>
        </View>

        {/* Product Listing */}
        <View style={styles.productGrid}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard} wrap={false}>
              {product.images?.[0] ? (
                <Image src={product.images[0].url} style={styles.productImage} />
              ) : (
                <View style={styles.productImage} />
              )}

              {product.category && (
                <Text style={styles.categoryLabel}>{product.category.name}</Text>
              )}

              <Text style={styles.productName}>{product.name}</Text>

              {product.shortDescription && (
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.shortDescription}
                </Text>
              )}

              <View style={{ marginTop: "auto" }}>
                {product.material && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Material:</Text>
                    <Text style={styles.specValue}>{product.material}</Text>
                  </View>
                )}
                {product.application && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>App:</Text>
                    <Text style={styles.specValue}>{product.application}</Text>
                  </View>
                )}
                <Text style={styles.rfqTag}>REQUEST QUOTATION</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          © 2026 Gloves Manufacturing Co. | Industrial • Medical • Specialty PPE
        </Text>
      </Page>
    </Document>
  );
}
