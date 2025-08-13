import React, { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [snapshot, setSnapshot] = useState(null);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera access denied or unavailable.");
      }
    };
    startCamera();
  }, []);

  // Get location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        (err) => {
          console.error("Location error:", err);
          setError("Unable to retrieve location.");
        }
      );
    } else {
      setError("Geolocation not supported.");
    }
  }, []);

  // Capture snapshot
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setSnapshot(canvas.toDataURL("image/png")); // save as base64
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>PWA Camera + Location</h1>

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Show location */}
      {location.lat && location.lon ? (
        <p>
          <strong>Latitude:</strong> {location.lat} <br />
          <strong>Longitude:</strong> {location.lon}
        </p>
      ) : (
        <p>Fetching location...</p>
      )}

      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: "400px",
          border: "2px solid black",
          borderRadius: "8px",
          marginTop: "10px"
        }}
      />

      {/* Take snapshot button */}
      <div>
        <button
          onClick={takeSnapshot}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          📸 Take Snapshot
        </button>
      </div>

      {/* Hidden canvas for drawing */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {/* Show snapshot */}
      {snapshot && (
        <div style={{ marginTop: "10px" }}>
          <h3>Captured Snapshot</h3>
          <img
            src={snapshot}
            alt="Snapshot"
            style={{
              maxWidth: "100%",
              border: "2px solid black",
              borderRadius: "8px"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
