import React, { useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Typography,
    Divider,
    InputAdornment,
    MenuItem,
    Button,
    Tabs,
    Tab,
    ListItem,
    ListItemText,
    List,
    IconButton,
    Paper
} from "@mui/material";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import jsPDF from "jspdf";

const getInitialFormData = () => ({
    item_number: "",
    item_name: "",
    item_pic: "",
    product_category: "",
    size: "",
    metal: "",
    purity: "",
    gross_weight: "",
    weight_adjustment: "",
    weight_adjustment_note: "",
    net_weight: "",
    number_of_stones: "",
    stones: [{ name: "", category: "", weight: "", quantity: "", price: "" }],
    labour_charges: "",
    kundan: "",
    beads: "",
    hallmark: "",
    additional_charges: "",
    metal_rate_per_gram: ""
});

export default function GemstoneForm() {
    const [salesForm, setSalesForm] = useState(getInitialFormData());
    const [tab, setTab] = useState(0);
    const [savedEntries, setSavedEntries] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const productCategories = ["Ring", "Chain", "Pendant"];
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openDetailsModal = (entry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEntry(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSalesForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStoneChange = (index, e) => {
        const { name, value } = e.target;
        const updatedStones = [...salesForm.stones];
        updatedStones[index][name] = value;
        setSalesForm((prev) => ({ ...prev, stones: updatedStones }));
    };

    const addStone = () => {
        setSalesForm((prev) => ({
            ...prev,
            stones: [...prev.stones, { name: "", category: "", weight: "", quantity: "", price: "" }]
        }));
    };

    const removeStone = (index) => {
        if (salesForm.stones.length === 1) return; // Prevent removing last stone
        const updatedStones = salesForm.stones.filter((_, i) => i !== index);
        setSalesForm((prev) => ({ ...prev, stones: updatedStones }));
    };

    const calculateTotals = () => {
        const totalStonePrice = salesForm.stones.reduce(
            (acc, stone) => acc + parseFloat(stone.price || 0),
            0
        );
        const totalCharges =
            parseFloat(salesForm.labour_charges || 0) +
            parseFloat(salesForm.kundan || 0) +
            parseFloat(salesForm.beads || 0) +
            parseFloat(salesForm.hallmark || 0) +
            parseFloat(salesForm.additional_charges || 0);
        const totalMetalRate =
            parseFloat(salesForm.net_weight || 0) * parseFloat(salesForm.metal_rate_per_gram || 0);
        return { totalStonePrice, totalCharges, totalMetalRate };
    };

    const handleSaveEntry = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(salesForm),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to save entry';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If parsing JSON fails, keep default errorMessage
                }
                throw new Error(errorMessage);
            }


            const result = await response.json();
            console.log('Server response:', result);

            if (editIndex !== null) {
                const updated = [...savedEntries];
                updated[editIndex] = salesForm;
                setSavedEntries(updated);
                setEditIndex(null);
            } else {
                setSavedEntries((prev) => [...prev, salesForm]);
            }

            setSalesForm(getInitialFormData());
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save entry. Check console for details.');
        }
    };

    const handleDeleteEntry = (index) => {
        setSavedEntries(savedEntries.filter((_, i) => i !== index));
    };

    const handleEditEntry = (index) => {
        setSalesForm(savedEntries[index]);
        setEditIndex(index);
        setTab(0);
    };

    const downloadPDF = () => {
        const pdf = new jsPDF();

        let yPos = 10;
        const lineHeight = 10;

        const fieldsToPrint = [
            "item_number",
            "item_name",
            "product_category",
            "size",
            "metal",
            "purity",
            "gross_weight",
            "weight_adjustment",
            "weight_adjustment_note",
            "net_weight",
            "number_of_stones",
            "labour_charges",
            "kundan",
            "beads",
            "hallmark",
            "additional_charges",
            "metal_rate_per_gram"
        ];

        pdf.setFontSize(14);
        pdf.text("Gemstone Form Entry", 10, yPos);
        yPos += lineHeight * 2;

        pdf.setFontSize(12);
        fieldsToPrint.forEach((field) => {
            const label = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const value = salesForm[field] || "-";
            pdf.text(`${label}: ${value}`, 10, yPos);
            yPos += lineHeight;
            if (yPos > 280) {
                pdf.addPage();
                yPos = 10;
            }
        });

        pdf.text("Stones Details:", 10, yPos);
        yPos += lineHeight;

        salesForm.stones.forEach((stone, index) => {
            pdf.text(`Stone ${index + 1}:`, 12, yPos);
            yPos += lineHeight;

            Object.entries(stone).forEach(([key, val]) => {
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                pdf.text(`- ${label}: ${val || "-"}`, 16, yPos);
                yPos += lineHeight;
                if (yPos > 280) {
                    pdf.addPage();
                    yPos = 10;
                }
            });

            yPos += lineHeight / 2;
        });

        pdf.save("form-entry.pdf");
    };

    const filteredEntries = savedEntries.filter((entry) =>
        entry.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={3}>
            <Tabs value={tab} onChange={(_, val) => setTab(val)} centered>
                <Tab label="Sales Form" />
                <Tab label="Saved Entries" />
            </Tabs>

            {tab === 0 && (
                <Box mt={3}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Sales Form
                    </Typography>

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
                                "product_name"
                            ].map((name) => (
                                <Grid item xs={12} sm={6} md={4} key={name}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        name={name}
                                        label={name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        value={salesForm[name]}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            ))}

                            {/* Upload Item Picture */}
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
                                                    setSalesForm((prev) => ({
                                                        ...prev,
                                                        item_pic: reader.result
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </Button>

                                {/* Image Preview */}
                                {salesForm.item_pic && (
                                    <Box mt={2}>
                                        <Typography variant="body2" gutterBottom>Preview:</Typography>
                                        <Box
                                            component="img"
                                            src={salesForm.item_pic}
                                            alt="Item Preview"
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                objectFit: 'cover',
                                                borderRadius: 2,
                                                border: '1px solid #ccc',
                                            }}
                                        />
                                    </Box>
                                )}
                            </Grid>

                        </Grid>
                    </Paper>

                    {/* Stone Details */}
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Stone Details
                        </Typography>
                        {salesForm.stones.map((stone, index) => (
                            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
                                {["name", "category", "weight", "quantity", "price"].map((key) => (
                                    <Grid item xs={12} sm={6} md={2.4} key={key}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={`${key.charAt(0).toUpperCase() + key.slice(1)} ${index + 1}`}
                                            name={key}
                                            value={stone[key]}
                                            onChange={(e) => handleStoneChange(index, e)}
                                        />
                                    </Grid>
                                ))}
                                <Grid item>
                                    <IconButton
                                        onClick={() => removeStone(index)}
                                        disabled={salesForm.stones.length === 1}
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

                    {/* Charges */}
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
                                        label={name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        value={salesForm[name]}
                                        onChange={handleChange}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Totals */}
                        <Box mt={3}>
                            <Typography variant="body1">
                                <strong>Total Stone Price:</strong> ₹{calculateTotals().totalStonePrice.toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Charges:</strong> ₹{calculateTotals().totalCharges.toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Metal Rate:</strong> ₹{calculateTotals().totalMetalRate.toFixed(2)}
                            </Typography>
                        </Box>

                        <Box mt={3}>
                            <Button variant="contained" onClick={handleSaveEntry} sx={{ mr: 2 }}>
                                {editIndex !== null ? "Update Entry" : "Save Entry"}
                            </Button>
                            <Button variant="outlined" onClick={downloadPDF}>
                                Download PDF
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            )}

            {/* Saved Entries Tab */}
            {tab === 1 && (
                <Box mt={3}>
                    <TextField
                        label="Search by Item Name"
                        fullWidth
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Paper variant="outlined">
                        <List>
                            {filteredEntries.map((entry, index) => (
                                <ListItem
                                    key={index}
                                    divider
                                    button
                                    onClick={() => openDetailsModal(entry)}
                                    secondaryAction={
                                        <>
                                            <IconButton onClick={() => handleEditEntry(index)} aria-label="edit">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteEntry(index)} aria-label="delete">
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    }
                                >
                                    <ListItemText
                                        primary={entry.item_name}
                                        secondary={`Item #: ${entry.item_number} | Category: ${entry.product_category}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                    <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
                        <DialogTitle>Entry Details</DialogTitle>
                        <DialogContent dividers>
                            {selectedEntry && (
                                <Box>
                                    {Object.entries(selectedEntry).map(([key, value]) => {
                                        if (key === "stones") {
                                            return (
                                                <Box key={key} mt={2}>
                                                    <Typography variant="subtitle1">Stones:</Typography>
                                                    {value.map((stone, idx) => (
                                                        <Box key={idx} sx={{ ml: 2, mb: 1 }}>
                                                            <Typography variant="body2">Stone {idx + 1}</Typography>
                                                            {Object.entries(stone).map(([k, v]) => (
                                                                <Typography key={k} variant="caption">
                                                                    {k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}: {v || "-"}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            );
                                        }
                                        return (
                                            <Typography key={key} gutterBottom>
                                                <strong>{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> {value || "-"}
                                            </Typography>
                                        );
                                    })}
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeModal}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}
        </Box>
    );
}
