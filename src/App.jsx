import React, { useState, useEffect, useRef } from "react";

function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Capture Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy, // ✅ accuracy in meters
          });
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true } // ✅ request GPS-level accuracy if available
      );
    } else {
      setError("Geolocation not supported by this browser.");
    }
  }, []);

  // Start Camera
  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied or not available.");
      }
    }
    enableCamera();
  }, []);

  // Take Snapshot
  const takeSnapshot = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    setSnapshot(canvasRef.current.toDataURL("image/png"));
  };

  return (
    <div className="p-4">
      <h1>📍 PWA Demo</h1>

      {location ? (
        <p>
          <strong>Latitude:</strong> {location.lat} <br />
          <strong>Longitude:</strong> {location.lng} <br />
          <strong>Accuracy:</strong> ±{location.accuracy} meters
        </p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>Getting location…</p>
      )}

      <div>
        <video ref={videoRef} autoPlay playsInline width="320" height="240" />
        <br />
        <button onClick={takeSnapshot}>📸 Take Snapshot</button>
        <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
      </div>

      {snapshot && (
        <div>
          <h3>Snapshot:</h3>
          <img src={snapshot} alt="snapshot" />
        </div>
      )}
    </div>
  );
}

export default App;
