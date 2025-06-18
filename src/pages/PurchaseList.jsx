import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PurchaseList() {
  const [customerItems, setCustomerItems] = useState([]);
  const cardRefs = useRef({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/customers/purchased-customers")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setCustomerItems(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const downloadPDF = async (customerId, purchaseId) => {
    const input = cardRefs.current[`${customerId}-${purchaseId}`];
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`purchase-${purchaseId}.pdf`);
  };

  const groupedByCustomer = useMemo(() => {
    const groups = {};

    customerItems.forEach((item) => {
      const key = item.customer_name + "-" + item.customer_phone;

      if (!groups[key]) {
        groups[key] = {
          _id: key,
          customer_name: item.customer_name,
          customer_phone: item.customer_phone,
          purchases: [],
        };
      }

      groups[key].purchases.push(item);
    });

    return Object.values(groups);
  }, [customerItems]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        All Customer Purchases
      </Typography>

      {customerItems.length === 0 && (
        <Typography>No customer data found.</Typography>
      )}

      {groupedByCustomer.map((customer) => (
        <Box key={customer._id} mb={5}>
          <Typography variant="h6" gutterBottom>
            👤 {customer.customer_name} - {customer.customer_phone}
          </Typography>

          <Grid container spacing={3}>
            {customer.purchases.map((purchase) => (
              <Grid item xs={12} md={6} lg={4} key={purchase._id}>
                <Card
                  ref={(el) =>
                    (cardRefs.current[
                      `${customer._id}-${purchase._id}`
                    ] = el)
                  }
                  sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {purchase.product_name || "Unnamed Product"}
                    </Typography>

                    <Divider sx={{ mb: 1 }} />

                    <Typography variant="body2">
                      <strong>Net Weight:</strong> {purchase.net_weight}g
                    </Typography>
                    <Typography variant="body2">
                      <strong>Metal Rate/g:</strong> ₹
                      {purchase.metal_rate_per_gram}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Stones Total:</strong> ₹
                      {purchase.stones?.reduce(
                        (acc, s) =>
                          acc + (s.price || 0) * (s.quantity || 0),
                        0
                      )}
                    </Typography>

                    <Box mt={2}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={() =>
                          downloadPDF(customer._id, purchase._id)
                        }
                      >
                        Download PDF
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}