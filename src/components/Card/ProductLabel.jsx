import React from "react";
import { Box, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

const ProductLabel = React.forwardRef(({ item }, ref) => {
  return (
    <Box ref={ref} sx={{ width: "300px", p: 2, border: "1px solid #ccc" }}>
      {/* Product Image (if exists) */}
      {item.item_pic && (
        <Box mb={1} textAlign="center">
          <img
            src={item.item_pic}
            alt={item.item_name || "Product Image"}
            style={{
              maxWidth: "100%",
              maxHeight: "100px",
              objectFit: "contain",
              marginBottom: "8px",
            }}
          />
        </Box>
      )}

      <Typography variant="h6">{item.item_name}</Typography>
      <Typography variant="body2">ID: {item.item_number}</Typography>
      <Typography variant="body2">Weight: {item.net_weight}g</Typography>
      <Typography variant="body2">Rate/gm: ₹{item.metal_rate_per_gram}</Typography>
      <Typography variant="body2">Purity: {item.purity || "N/A"}</Typography>
     
      <Box mt={2} textAlign="center">
        <QRCodeSVG value={item.item_number || "No-ID"} size={64} />
      </Box>
    </Box>
  );
});

export default ProductLabel;