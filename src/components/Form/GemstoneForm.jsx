import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function GemstoneFormSection({
  formData,
  onChange,
  onStoneChange,
  addStone,
  removeStone,
  calculateTotals,
  onSave,
  onDownload,
  editIndex,
  type,
  onEdit,
}) {
  const safeFormData = formData || {};
  const totals = calculateTotals(safeFormData);

  return (
    <Box mt={3}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {type === "customer" ? "Customer Copy" : "Sales Form"}
      </Typography>

      {type === "customer" && (
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Name"
              name="customer_name"
              value={safeFormData.customer_name || ""}
              onChange={onChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone"
              name="customer_phone"
              value={safeFormData.customer_phone || ""}
              onChange={onChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              name="customer_city"
              value={safeFormData.customer_city || ""}
              onChange={onChange}
              fullWidth
            />
          </Grid>
        </Grid>
      )}

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Item Details
        </Typography>
        <Grid container spacing={2}>
          {[
            "item_number",
            "item_name",
            "size",
            "metal",
            "purity",
            "gross_weight",
            "weight_adjustment",
            "weight_adjustment_note",
            "net_weight",
            "number_of_stones",
            "product_name",
          ].map((name) => (
            <Grid item xs={12} sm={6} md={4} key={name}>
              <TextField
                fullWidth
                size="small"
                name={name}
                label={name
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                value={safeFormData[name] || ""}
                onChange={onChange}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button component="label" variant="outlined">
              Upload Item picture
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onChange({
                        target: { name: "item_pic", value: reader.result },
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Button>

            {safeFormData.item_pic && (
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  Preview:
                </Typography>
                <Box
                  component="img"
                  src={safeFormData.item_pic}
                  alt="Item Preview"
                  sx={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid #ccc",
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Stone Details
        </Typography>
        {safeFormData.stones?.map((stone, index) => (
          <Grid
            container
            spacing={2}
            key={index}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            {["name", "category", "weight", "quantity", "price"].map((key) => (
              <Grid item xs={12} sm={6} md={2.4} key={key}>
                <TextField
                  fullWidth
                  size="small"
                  label={`${key.charAt(0).toUpperCase() + key.slice(1)} ${
                    index + 1
                  }`}
                  name={key}
                  value={stone[key] || ""}
                  onChange={(e) => onStoneChange(index, e)}
                />
              </Grid>
            ))}
            <Grid item>
              <IconButton
                onClick={() => removeStone(index)}
                disabled={safeFormData.stones.length === 1}
                aria-label="remove stone"
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button onClick={addStone} sx={{ mt: 2 }} variant="outlined">
          + Add Stone
        </Button>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Charges
        </Typography>
        <Grid container spacing={2}>
          {[
            "labour_charges",
            "kundan",
            "beads",
            "hallmark",
            "additional_charges",
            "metal_rate_per_gram",
          ].map((name) => (
            <Grid item xs={12} sm={6} md={4} key={name}>
              <TextField
                fullWidth
                size="small"
                name={name}
                label={name
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                value={safeFormData[name] || ""}
                onChange={onChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Box mt={3}>
          <Typography variant="body1">
            <strong>Total Stone Price:</strong> ₹
            {totals.totalStonePrice.toFixed(2)}
          </Typography>
          <Typography variant="body1">
            <strong>Total Charges:</strong> ₹{totals.totalCharges.toFixed(2)}
          </Typography>
          <Typography variant="body1">
            <strong>Total Metal Rate:</strong> ₹
            {totals.totalMetalRate.toFixed(2)}
          </Typography>
        </Box>

        <Box mt={3}>
          <Button variant="contained" onClick={onSave} sx={{ mr: 2 }}>
            {editIndex !== null ? "Update Entry" : "Save Entry"}
          </Button>
          <Button variant="outlined" onClick={onDownload}>
            Download PDF
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}