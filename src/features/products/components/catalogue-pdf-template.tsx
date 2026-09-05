/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Define professional colors
const COLORS = {
  primary: "#202226", // Charcoal
  accent: "#BC8B2C", // Amber
  text: "#333333",
  muted: "#666666",
  border: "#EEEEEE",
  bg: "#FAFAFA",
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
  },
  coverPage: {
    height: "100%",
    backgroundColor: COLORS.primary,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 18,
    color: COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: 4,
    marginBottom: 40,
    textAlign: "center",
  },
  coverFooter: {
    position: "absolute",
    bottom: 60,
    color: "#FFFFFF",
    opacity: 0.6,
    fontSize: 12,
    textAlign: "center",
  },
  contentContainer: {
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingBottom: 20,
    marginBottom: 30,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  brandSub: {
    color: COLORS.accent,
  },
  categorySection: {
    marginBottom: 40,
  },
  categoryHeader: {
    backgroundColor: COLORS.bg,
    padding: "10 15",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  productCard: {
    width: "48%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "#F9F9F9",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.4,
    marginBottom: 10,
    height: 35, // Fixed height for alignment
  },
  specRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  specLabel: {
    fontSize: 7,
    fontWeight: "bold",
    width: 60,
    color: COLORS.muted,
  },
  specValue: {
    fontSize: 7,
    color: COLORS.primary,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    textAlign: "center",
    color: "#AAA",
    fontSize: 8,
  },
});

export function CataloguePdfTemplate({ products }: { products: any[] }) {
  // Group products by category
  const groups: Record<string, any[]> = {};
  products.forEach((p) => {
    const catName = p.category?.name || "Uncategorized";
    if (!groups[catName]) groups[catName] = [];
    groups[catName].push(p);
  });

  const categoryNames = Object.keys(groups);

  return (
    <Document title="VU Gloves - Product Catalogue 2026">
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.coverTitle}>VU Gloves</Text>
          <Text style={styles.coverSubtitle}>Product Catalogue 2026</Text>
          <View style={{ width: 100, height: 2, backgroundColor: COLORS.accent, marginBottom: 20 }} />
          <Text style={{ color: "#FFFFFF", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
            Precision-engineered protective solutions for global industries.
          </Text>
          <Text style={styles.coverFooter}>© 2026 VU Gloves Co. | Professional Protective Gear</Text>
        </View>
      </Page>

      {/* Product Content Pages */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brandName}>
                VU<Text style={styles.brandSub}>Gloves</Text>
              </Text>
              <Text style={{ color: COLORS.muted, fontSize: 8 }}>Precision Industrial Quality</Text>
            </View>
            <View style={{ textAlign: "right" }}>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>Collection 2026</Text>
              <Text style={{ color: COLORS.muted, fontSize: 8 }}>www.vugloves.com</Text>
            </View>
          </View>

          {categoryNames.map((catName) => (
            <View key={catName} style={styles.categorySection} wrap={false}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{catName}</Text>
              </View>

              <View style={styles.productGrid}>
                {groups[catName]?.map((product) => (
                  <View key={product.id} style={styles.productCard} wrap={false}>
                    <View style={styles.imageContainer}>
                      {product.images?.[0] ? (
                        <Image src={product.images[0].url} style={styles.productImage} />
                      ) : null}
                    </View>

                    <View style={styles.productDetails}>
                      <Text style={styles.productName}>{product.name}</Text>
                      {product.shortDescription && (
                        <Text style={styles.productDescription}>
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
                        {product.protectionLevel && (
                          <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Protection:</Text>
                            <Text style={styles.specValue}>{product.protectionLevel}</Text>
                          </View>
                        )}
                        {product.sku && (
                          <View style={styles.specRow}>
                            <Text style={styles.specLabel}>SKU:</Text>
                            <Text style={styles.specValue}>{product.sku}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
