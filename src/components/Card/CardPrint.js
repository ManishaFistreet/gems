import React, { useRef, useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Grid, Paper
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import html2pdf from 'html2pdf.js';

const gemFields = {
  gemstone: {
    certificateNo: '', name: '', color: '', purity: '', shapesAndCut: '', dimensions: '', opticCharacter: '', specificGravity: '', refractiveIndex: '', speciesGroup: '', comment: '', issuedTo: '', photo: ''
  },
  diamond: {
    certificateNo: '', name: '', color: '', purity: '', dimensions: '', cut: '', clarity: '', caratWt: '', comment: '', issuedTo: '', photo: ''
  },
  rudraksha: {
    certificateNo: '', name: '', description: '', color: '', purity: '', shape: '', dimensions: '', naturalFaces: '', weight: '', issuedTo: '', photo: ''
  }
};

export default function CardPrint() {
  const [selectedType, setSelectedType] = useState('gemstone');
  const [data, setData] = useState(gemFields[selectedType]);
  const ref = useRef();

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleTypeChange = e => {
    const type = e.target.value;
    setSelectedType(type);
    setData(gemFields[type]);
  };

  const handleDownloadPDF = () => {
    const element = ref.current;
    const opt = {
      margin: 0.5,
      filename: `${selectedType.toUpperCase()}Card-${data.name || 'certificate'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

const handleSave = async () => {
  try {
    // Check if the certificateNo already exists
    const existing = await axios.get(
      `http://localhost:5000/api/products/by-certificate/${data.certificateNo}`
    );

    if (existing.data) {
      alert("Certificate Number already exists. Cannot save duplicate entry.");
      return;
    }
  } catch (err) {
    if (err.response && err.response.status !== 404) {
      console.error(err);
      alert("Error checking for existing certificate number.");
      return;
    }
  }

  try {
    const payload = {
      type: selectedType,
      ...data,
    };

    await axios.post("http://localhost:5000/api/products", payload);
    alert("Card saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to save card.");
  }
};

  const generateQRData = () => {
    const { photo, ...rest } = data;
    return JSON.stringify({ type: selectedType, ...rest }, null, 2);
  };

  useEffect(() => {
    if (data.certificateNo?.length >= 3) {
      const fetchData = debounce(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/products/by-certificate/${data.certificateNo}`);
          const fetchedData = res.data;
          delete fetchedData._id;
          delete fetchedData.__v;
          delete fetchedData.createdAt;
          delete fetchedData.updatedAt;

          setSelectedType(fetchedData.type);
          setData({ ...gemFields[fetchedData.type], ...fetchedData });
        } catch (err) {
          console.log("Product not found or error", err);
        }
      }, 500);

      fetchData();

      return () => fetchData.cancel?.();
    }
  }, [data.certificateNo]);


  return (
    <Box p={5}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Card Generator</Typography>

        <TextField
          select
          label="Select Gem Type"
          value={selectedType}
          onChange={handleTypeChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="gemstone">Gemstone</MenuItem>
          <MenuItem value="diamond">Diamond</MenuItem>
          <MenuItem value="rudraksha">Rudraksha</MenuItem>
        </TextField>

        <Grid container spacing={2}>
          {Object.keys(data).map((field) => (
            <Grid item xs={12} md={6} key={field}>
              {field === 'photo' ? (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setData((prev) => ({ ...prev, photo: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
              ) : (
                <TextField
                  label={field.replace(/([A-Z])/g, ' $1')}
                  name={field}
                  value={data[field]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              )}
            </Grid>
          ))}
        </Grid>

        <Button onClick={handleDownloadPDF} variant="contained" color="primary" sx={{ mt: 2 }}>
          Download Card as PDF
        </Button>

        <Button
          onClick={handleSave}
          variant="outlined"
          color="success"
          sx={{ mt: 2, ml: 2 }}
        >
          Save Entry
        </Button>

      </Paper>

      {/* This is the content that will be printed */}
      <div ref={ref}>
        <Paper
          // ref={ref}
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 500,
            mx: 'auto',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #ccc',
            backgroundColor: '#eff6fd',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: '#99d0f7',
              px: 2,
              py: 1.2,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', color: '#0c1c39', lineHeight: 1 }}
              >
                DUMMY<sup style={{ fontSize: '10px' }}>™</sup>
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#0c1c39' }}>
                DIAMOND & GEM LABORATORIES
              </Typography>
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ p: 1 }}>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ fontWeight: 'bold', mb: 1, color: '#0c1c39', fontSize: '0.9rem' }}
            >
              CERTIFICATE OF AUTHENTICITY
            </Typography>

            <Grid container spacing={12}>
              {/* Left Column: Details */}
              <Grid item xs={7}>
                {Object.entries(data).map(
                  ([key, val]) =>
                    key !== 'photo' && (
                      <Box
                        key={key}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 0.2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        >
                          {key.replace(/([A-Z])/g, ' $1').toUpperCase()}:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: ['clarity', 'color', 'weight', 'certificationNumber'].includes(key)
                              ? 700
                              : 400,
                            fontSize: '0.7rem',
                            paddingLeft: "80px"
                          }}
                        >
                          {val || 'N/A'}
                        </Typography>
                      </Box>
                    )
                )}
              </Grid>

              {/* Right Column: Image + QR */}
              <Grid item xs={12} md={5} ml={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    height: '100%',
                  }}
                >
                  {data.photo && (
                    <Box sx={{ width: 100, height: 90, overflow: 'hidden', mb: 1 }}>
                      <img
                        src={data.photo}
                        alt="Gem"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <QRCodeCanvas value={generateQRData()} size={80} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </div>
    </Box>
  );
}