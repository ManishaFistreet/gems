// src/components/PrintableDetails.jsx
import { Box, Typography, Divider } from "@mui/material";

export default function PrintableDetails({ formData, type }) {
  const {
    item_name,
    item_number,
    gross_weight,
    weight_adjustment,
    net_weight,
    metal_rate_per_gram,
    labour_charges,
    kundan,
    beads,
    hallmark,
    additional_charges,
    stones = [],
  } = formData;

  return (
    <Box p={3} sx={{ fontSize: "30px", color: "#000", width: "100%" }}>
      <Typography variant="h5" gutterBottom>{type === "sales" ? "Sales Details" : "Customer Details"}</Typography>
      <Divider sx={{ my: 2 }} />

      <Typography sx={{fontSize:"30px"}}><strong>Item Name:</strong> {item_name}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Item Number:</strong> {item_number}</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography sx={{fontSize:"30px"}}><strong>Gross Weight:</strong> {gross_weight}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Weight Adjustment:</strong> {weight_adjustment}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Net Weight:</strong> {net_weight}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Metal Rate/gm:</strong> {metal_rate_per_gram}</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography sx={{fontSize:"30px"}}><strong>Labour Charges:</strong> {labour_charges}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Kundan:</strong> {kundan}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Beads:</strong> {beads}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Hallmark:</strong> {hallmark}</Typography>
      <Typography sx={{fontSize:"30px"}}><strong>Additional Charges:</strong> {additional_charges}</Typography>

      {stones.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{fontSize:"30px"}} variant="h6">Stones</Typography>
          {stones.map((stone, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography sx={{fontSize:"30px"}}><strong>Name:</strong> {stone.name}</Typography>
              <Typography sx={{fontSize:"30px"}}><strong>Category:</strong> {stone.category}</Typography>
              <Typography sx={{fontSize:"30px"}}><strong>Weight:</strong> {stone.weight}</Typography>
              <Typography sx={{fontSize:"30px"}}><strong>Quantity:</strong> {stone.quantity}</Typography>
              <Typography sx={{fontSize:"30px"}}><strong>Price:</strong> {stone.price}</Typography>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}