// src/components/QRScanner.js
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';

function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    const qr = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            try {
              const parsed = JSON.parse(decodedText);
              setScanResult(parsed);
              qr.stop();

              // Scroll to result
              setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 300);
            } catch {
              setScanResult({ error: "Invalid QR data" });
            }
          }
        );
      }
    });

    scannerRef.current = qr;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <Box sx={{ mt: 2, px: 2 }}>
      <Typography variant="h5" gutterBottom>
        📷 Scan Gem QR Code
      </Typography>

      <div id="qr-reader" style={{ width: "100%", maxWidth: "400px", margin: "auto" }} />

      {scanResult && (
        <Card ref={resultRef} sx={{ mt: 4, p: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              {scanResult?.type?.toUpperCase() || "Gem Details"}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                {Object.entries(scanResult).map(([key, value]) =>
                  key !== 'photo' && key !== 'type' ? (
                    <Typography key={key} sx={{ mb: 1 }}>
                      <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                    </Typography>
                  ) : null
                )}
              </Grid>

              <Grid item xs={12} sm={5}>
                {scanResult.photo && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={scanResult.photo}
                    alt="Gem"
                    sx={{ objectFit: "contain", borderRadius: 1 }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default QRScanner;