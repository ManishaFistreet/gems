import React, { useEffect, useState } from "react";
import {
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GemstoneFormSection from "./GemstoneForm";
import SavedItemsList from "../../pages/SaveItemList";
import PrintableDetails from "../../components/Card/PrintableDetails";

export default function GemStoneFormTabs() {
  const [tab, setTab] = useState(0);
  const [savedTypeTab, setSavedTypeTab] = useState(0);
  const [savedItems, setSavedItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const initialForm = {
    stones: [{ name: "", category: "", weight: "", quantity: "", price: "" }],
    gross_weight: "",
    weight_adjustment: "",
    net_weight: "",
    metal_rate_per_gram: "",
    labour_charges: "",
    kundan: "",
    beads: "",
    hallmark: "",
    additional_charges: "",
    item_name: "",
    item_number: "",
    item_pic: "",
    type: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
  };

  const [salesFormData, setSalesFormData] = useState(initialForm);
  const [customerFormData, setCustomerFormData] = useState(initialForm);

  const cleanNumber = (value) =>
    parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;

  const sanitizeFormData = (data) => ({
    ...data,
    gross_weight: cleanNumber(data.gross_weight),
    net_weight: cleanNumber(data.net_weight),
    weight_adjustment: cleanNumber(data.weight_adjustment),
    metal_rate_per_gram: cleanNumber(data.metal_rate_per_gram),
    labour_charges: cleanNumber(data.labour_charges),
    kundan: cleanNumber(data.kundan),
    beads: cleanNumber(data.beads),
    hallmark: cleanNumber(data.hallmark),
    additional_charges: cleanNumber(data.additional_charges),
    stones: data.stones.map((stone) => ({
      ...stone,
      weight: cleanNumber(stone.weight),
      quantity: cleanNumber(stone.quantity),
      price: cleanNumber(stone.price),
    })),
    customer_name: data.customer_name?.trim() || "",
    customer_phone: data.customer_phone?.trim() || "",
    customer_email: data.customer_email?.trim() || "",
    customer_address: data.customer_address?.trim() || "",
  });

  const activeFormData = tab === 0 ? salesFormData : customerFormData;
  const setActiveFormData = tab === 0 ? setSalesFormData : setCustomerFormData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActiveFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoneChange = (index, e) => {
    const { name, value } = e.target;
    const updatedStones = [...activeFormData.stones];
    updatedStones[index][name] = value;
    setActiveFormData((prev) => ({ ...prev, stones: updatedStones }));
  };

  const addStone = () => {
    setActiveFormData((prev) => ({
      ...prev,
      stones: [...prev.stones, { name: "", category: "", weight: "", quantity: "", price: "" }],
    }));
  };

  const removeStone = (index) => {
    setActiveFormData((prev) => {
      const updatedStones = [...prev.stones];
      updatedStones.splice(index, 1);
      return { ...prev, stones: updatedStones };
    });
  };

  const calculateTotals = () => {
    const currentForm = tab === 0 ? salesFormData : customerFormData;

    const stones = currentForm?.stones || [];
    const totalStonePrice = stones.reduce((sum, stone) => {
      const price = parseFloat(stone.price || 0);
      const quantity = parseFloat(stone.quantity || 0);
      return sum + price * quantity;
    }, 0);

    const totalCharges =
      parseFloat(currentForm.labour_charges || 0) +
      parseFloat(currentForm.kundan || 0) +
      parseFloat(currentForm.beads || 0) +
      parseFloat(currentForm.hallmark || 0) +
      parseFloat(currentForm.additional_charges || 0);

    const totalMetalRate =
      parseFloat(currentForm.metal_rate_per_gram || 0) *
      parseFloat(currentForm.net_weight || 0);

    return { totalStonePrice, totalCharges, totalMetalRate };
  };

  const handleDownload = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) {
      alert("No content to download");
      return;
    }

    element.style.display = "block";

    const currentForm = tab === 0 ? salesFormData : customerFormData;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      let y = 10;

      if (currentForm.item_pic) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = currentForm.item_pic;

  await new Promise((resolve, reject) => {
    img.onload = () => resolve(null);
    img.onerror = reject;
  });

  const format = currentForm.item_pic.startsWith("data:image/png")
    ? "PNG"
    : "JPEG";

  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = 35; // Increase image width (mm)
  const imgHeight = 35; // Adjust height if needed
  const centerX = (pageWidth - imgWidth) / 2;

  pdf.addImage(img, format, centerX, y, imgWidth, imgHeight);
  y += imgHeight + 10;
}

      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pdfWidth - 20;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 10, y, contentWidth, contentHeight);
      pdf.save(`item-${tab === 0 ? "sales" : "customer"}-details.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      element.style.display = "none";
    }
  };

  useEffect(() => {
    if (tab === 2) {
      const type = savedTypeTab === 0 ? "sales" : "customer";
      fetchSavedItems(type);
    }
  }, [tab, savedTypeTab]);

  const handleSave = async () => {
    const currentFormData = tab === 0 ? salesFormData : customerFormData;
    const sanitizedData = sanitizeFormData(currentFormData);
    const isSales = tab === 0;

    const endpoint = isSales
       ? "http://18.60.181.218:4019/api/sales"
      : "http://18.60.181.218:4019/api/customers";

    try {
      if (!isSales && editIndex !== null) {
        await axios.put(`${endpoint}/${editIndex}`, sanitizedData);
        alert("Customer item updated successfully!");
      } else {
        const res = await axios.post(endpoint, sanitizedData);
        setSavedItems((prev) => [...prev, res.data]);
        alert("Item saved successfully!");
      }
      if (isSales) {
        setSalesFormData(initialForm);
      } else {
        setCustomerFormData(initialForm);
      }
      setEditIndex(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save item");
    }
  };

  const fetchSavedItems = async (type) => {
    try {
      const endpoint =
        type === "sales"
          ? "http://18.60.181.218:4019/api/sales"
          : "http://18.60.181.218:4019/api/customers";

      const res = await axios.get(endpoint);
      setSavedItems(res.data);
    } catch (err) {
      console.error("Failed to load saved entries", err);
    }
  };

const handleEditItem = (item) => {
  if (savedTypeTab === 0) {
    setSalesFormData(item);
    setTab(0);
    setEditIndex(item._id);
  } else {
    setCustomerFormData(item);
    setTab(1);
    setEditIndex(item._id);
  }
};
  return (
    <Box p={3}>
      <Tabs value={tab} onChange={(e, val) => setTab(val)} centered>
        <Tab label="Sales Copy" />
        <Tab label="Customer Copy" />
        <Tab label="Saved Entries" />
      </Tabs>

      {tab === 0 && (
        <>
          <GemstoneFormSection
            type="sales"
            formData={salesFormData}
            onChange={handleChange}
            onStoneChange={handleStoneChange}
            addStone={addStone}
            removeStone={removeStone}
            calculateTotals={calculateTotals}
            onSave={handleSave}
            onDownload={handleDownload}
            editIndex={editIndex}
          />
          <div id="pdf-content" style={{ display: "none", padding: "20px", background: "#fff" }}>
            <PrintableDetails formData={salesFormData} type="sales" />
          </div>
        </>
      )}

      {tab === 1 && (
        <>
          <GemstoneFormSection
            type="customer"
            formData={customerFormData}
            onChange={handleChange}
            onStoneChange={handleStoneChange}
            addStone={addStone}
            removeStone={removeStone}
            calculateTotals={calculateTotals}
            onSave={handleSave}
            onDownload={handleDownload}
            editIndex={editIndex}
          />
          <div id="pdf-content" style={{ display: "none", padding: "20px", background: "#fff" }}>
            <PrintableDetails formData={customerFormData} type="customer" />
          </div>
        </>
      )}

      {tab === 2 && (
        <Box mt={3}>
          <Tabs
            value={savedTypeTab}
            onChange={(e, val) => setSavedTypeTab(val)}
            sx={{ mb: 2 }}
            centered
          >
            <Tab label="Saved Sales" />
            <Tab label="Saved Customers" />
          </Tabs>

          <SavedItemsList
            items={savedItems}
            onEdit={handleEditItem}
            type={savedTypeTab === 0 ? "sales" : "customer"}
          />
        </Box>
      )}
    </Box>
  );
}