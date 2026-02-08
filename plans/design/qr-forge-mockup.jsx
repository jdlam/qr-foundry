import { useState, useRef, useEffect, useCallback } from "react";

const DOT_STYLES = [
  { id: "square", label: "■", name: "Square" },
  { id: "rounded", label: "●", name: "Rounded" },
  { id: "dots", label: "◉", name: "Dots" },
  { id: "diamond", label: "◆", name: "Diamond" },
];

const EYE_STYLES = [
  { id: "square", label: "▣", name: "Square" },
  { id: "rounded", label: "◍", name: "Round" },
  { id: "circle", label: "◎", name: "Circle" },
  { id: "leaf", label: "❧", name: "Leaf" },
];

const INPUT_TYPES = [
  { id: "url", label: "URL", icon: "🔗" },
  { id: "text", label: "Text", icon: "✎" },
  { id: "wifi", label: "WiFi", icon: "◐" },
  { id: "phone", label: "Phone", icon: "✆" },
  { id: "vcard", label: "vCard", icon: "⊡" },
  { id: "email", label: "Email", icon: "✉" },
  { id: "sms", label: "SMS", icon: "⊞" },
  { id: "geo", label: "Location", icon: "◎" },
  { id: "calendar", label: "Event", icon: "▦" },
];

const TABS = [
  { id: "generator", label: "Generator", icon: "◧" },
  { id: "batch", label: "Batch", icon: "▤" },
  { id: "scanner", label: "Scanner", icon: "⊞" },
  { id: "history", label: "History", icon: "↻" },
  { id: "templates", label: "Templates", icon: "◫" },
];

const LOGO_POSITIONS = [
  { id: "center", label: "Center", desc: "Logo in the center of the QR code" },
  { id: "top-left", label: "Top Left", desc: "Overlays the top-left finder eye" },
  { id: "top-right", label: "Top Right", desc: "Overlays the top-right finder eye" },
  { id: "bottom-left", label: "Bottom Left", desc: "Overlays the bottom-left finder eye" },
  { id: "all-corners", label: "All Corners", desc: "Logo on all three finder eyes" },
];

function generateQrMatrix(text, size = 33) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const matrix = [];
  const seed = Math.abs(hash);
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const isFP = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      const isFB = (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
      if (isFP) {
        const lx = x < 7 ? x : x >= size - 7 ? x - (size - 7) : x;
        const ly = y < 7 ? y : y >= size - 7 ? y - (size - 7) : y;
        row.push((lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4)) ? 1 : 0);
      } else if (isFB) {
        row.push(0);
      } else {
        row.push(((seed * (x + 1) * (y + 1) + x * 7 + y * 13) >>> 0) % 100 < 45 ? 1 : 0);
      }
    }
    matrix.push(row);
  }
  return matrix;
}

function QrPreview({ config, style, validationState }) {
  const canvasRef = useRef(null);
  const content = config.content || "https://example.com";
  const matrix = generateQrMatrix(content);
  const size = matrix.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const cellSize = w / (size + 2);
    const offset = cellSize;

    if (style.transparentBg) {
      ctx.clearRect(0, 0, w, h);
      for (let iy = 0; iy < h; iy += 8)
        for (let ix = 0; ix < w; ix += 8) {
          ctx.fillStyle = (Math.floor(ix / 8) + Math.floor(iy / 8)) % 2 === 0 ? "#f0f0f0" : "#fff";
          ctx.fillRect(ix, iy, 8, 8);
        }
    } else {
      ctx.fillStyle = style.background;
      ctx.fillRect(0, 0, w, h);
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!matrix[y][x]) continue;
        const px = offset + x * cellSize;
        const py = offset + y * cellSize;

        if (style.gradient) {
          const t = (x + y) / (size * 2);
          ctx.fillStyle = lerpColor(style.gradient.from, style.gradient.to, t);
        } else {
          ctx.fillStyle = style.foreground;
        }

        const isEye = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
        const pad = cellSize * 0.08;

        if (isEye) {
          switch (style.eyeStyle) {
            case "rounded": rRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, cellSize * 0.3); break;
            case "circle": ctx.beginPath(); ctx.arc(px + cellSize / 2, py + cellSize / 2, (cellSize - pad * 2) / 2, 0, Math.PI * 2); ctx.fill(); break;
            case "leaf": rRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, cellSize * 0.45); break;
            default: ctx.fillRect(px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2);
          }
        } else {
          switch (style.dotStyle) {
            case "rounded": rRect(ctx, px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2, cellSize * 0.35); break;
            case "dots": ctx.beginPath(); ctx.arc(px + cellSize / 2, py + cellSize / 2, (cellSize - pad * 2) * 0.45, 0, Math.PI * 2); ctx.fill(); break;
            case "diamond":
              ctx.beginPath(); ctx.moveTo(px + cellSize / 2, py + pad); ctx.lineTo(px + cellSize - pad, py + cellSize / 2);
              ctx.lineTo(px + cellSize / 2, py + cellSize - pad); ctx.lineTo(px + pad, py + cellSize / 2); ctx.closePath(); ctx.fill(); break;
            default: ctx.fillRect(px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2);
          }
        }
      }
    }

    const drawLogo = (cx, cy, logoSize) => {
      const lp = 5;
      ctx.fillStyle = style.transparentBg ? "#ffffff" : style.background;
      if (style.logoShape === "circle") {
        ctx.beginPath(); ctx.arc(cx, cy, logoSize / 2 + lp, 0, Math.PI * 2); ctx.fill();
      } else {
        rRect(ctx, cx - logoSize / 2 - lp, cy - logoSize / 2 - lp, logoSize + lp * 2, logoSize + lp * 2, 5);
      }
      ctx.fillStyle = style.gradient ? lerpColor(style.gradient.from, style.gradient.to, 0.5) : style.foreground;
      ctx.font = `bold ${logoSize * 0.42}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("QF", cx, cy);
    };

    if (style.logo) {
      const pos = style.logoPosition || "center";
      const centerLogoSize = w * 0.22;
      const cornerLogoSize = cellSize * 5;

      const tlCenter = { x: offset + 3 * cellSize + cellSize / 2, y: offset + 3 * cellSize + cellSize / 2 };
      const trCenter = { x: offset + (size - 4) * cellSize + cellSize / 2, y: offset + 3 * cellSize + cellSize / 2 };
      const blCenter = { x: offset + 3 * cellSize + cellSize / 2, y: offset + (size - 4) * cellSize + cellSize / 2 };

      if (pos === "center") {
        drawLogo(w / 2, h / 2, centerLogoSize);
      } else if (pos === "top-left") {
        drawLogo(tlCenter.x, tlCenter.y, cornerLogoSize);
      } else if (pos === "top-right") {
        drawLogo(trCenter.x, trCenter.y, cornerLogoSize);
      } else if (pos === "bottom-left") {
        drawLogo(blCenter.x, blCenter.y, cornerLogoSize);
      } else if (pos === "all-corners") {
        drawLogo(tlCenter.x, tlCenter.y, cornerLogoSize);
        drawLogo(trCenter.x, trCenter.y, cornerLogoSize);
        drawLogo(blCenter.x, blCenter.y, cornerLogoSize);
      }
    }
  }, [config.content, style, matrix, size]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <canvas ref={canvasRef} width={320} height={320}
        style={{ width: "100%", maxWidth: 320, height: "auto", borderRadius: 8 }} />
    </div>
  );
}

function rRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
}

function lerpColor(a, b, t) {
  const ah = parseInt(a.replace("#", ""), 16), bh = parseInt(b.replace("#", ""), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
}

function ValidationBadge({ state, onValidate }) {
  const c = {
    bg: "#0c0c10", surface: "#141419", surfaceHover: "#1c1c24",
    border: "#252530", text: "#e8e8ed", textMuted: "#8888a0", textDim: "#555568",
    accent: "#f59e0b", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b",
  };

  if (state === "idle") {
    return (
      <button onClick={onValidate} style={{
        background: c.surfaceHover, border: `1px solid ${c.border}`,
        borderRadius: 8, padding: "8px 16px", color: c.textMuted,
        cursor: "pointer", fontSize: 12, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6,
        fontFamily: `'SF Pro Display', -apple-system, system-ui, sans-serif`,
        transition: "all 0.15s ease",
      }}>
        <span style={{ fontSize: 14 }}>🔍</span> Validate QR
      </button>
    );
  }

  if (state === "validating") {
    return (
      <div style={{
        background: `${c.accent}10`, border: `1px solid ${c.accent}30`,
        borderRadius: 8, padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 8, fontSize: 12,
      }}>
        <span style={{
          display: "inline-block", width: 14, height: 14,
          border: `2px solid ${c.accent}`, borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: c.accent, fontWeight: 600 }}>Validating...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === "pass") {
    return (
      <div style={{
        background: `${c.success}10`, border: `1px solid ${c.success}30`,
        borderRadius: 8, padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 8, fontSize: 12,
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          background: c.success, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800,
        }}>✓</span>
        <div>
          <div style={{ color: c.success, fontWeight: 700 }}>Scan Verified</div>
          <div style={{ color: c.textDim, fontSize: 10, marginTop: 1 }}>Content decoded successfully — QR code is readable</div>
        </div>
        <button onClick={onValidate} style={{
          background: "none", border: "none", color: c.textDim,
          cursor: "pointer", fontSize: 10, marginLeft: "auto", padding: "2px 6px",
        }}>Re-test</button>
      </div>
    );
  }

  if (state === "warn") {
    return (
      <div style={{
        background: `${c.warning}10`, border: `1px solid ${c.warning}30`,
        borderRadius: 8, padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 8, fontSize: 12,
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          background: c.warning, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#000", fontSize: 12, fontWeight: 800,
        }}>!</span>
        <div>
          <div style={{ color: c.warning, fontWeight: 700 }}>Marginal Scan</div>
          <div style={{ color: c.textDim, fontSize: 10, marginTop: 1 }}>Decoded but reliability is low — try increasing error correction or reducing logo size</div>
        </div>
        <button onClick={onValidate} style={{
          background: "none", border: "none", color: c.textDim,
          cursor: "pointer", fontSize: 10, marginLeft: "auto", padding: "2px 6px",
        }}>Re-test</button>
      </div>
    );
  }

  if (state === "fail") {
    return (
      <div style={{
        background: `${c.danger}10`, border: `1px solid ${c.danger}30`,
        borderRadius: 8, padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 8, fontSize: 12,
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          background: c.danger, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800,
        }}>✕</span>
        <div>
          <div style={{ color: c.danger, fontWeight: 700 }}>Scan Failed</div>
          <div style={{ color: c.textDim, fontSize: 10, marginTop: 1 }}>Could not decode — increase error correction to H or reduce customization</div>
        </div>
        <button onClick={onValidate} style={{
          background: "none", border: "none", color: c.textDim,
          cursor: "pointer", fontSize: 10, marginLeft: "auto", padding: "2px 6px",
        }}>Re-test</button>
      </div>
    );
  }

  return null;
}

function LogoPositionPicker({ position, onChange, c }) {
  const grid = [
    ["top-left", null, "top-right"],
    [null, "center", null],
    ["bottom-left", null, null],
  ];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6 }}>Position</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {/* Visual grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 24px)", gridTemplateRows: "repeat(3, 24px)",
          gap: 2, background: c.surfaceHover, borderRadius: 6, padding: 4,
          border: `1px solid ${c.border}`,
        }}>
          {grid.flat().map((pos, i) => (
            <div key={i}
              onClick={() => pos && onChange(pos)}
              style={{
                width: 24, height: 24, borderRadius: 3,
                background: pos === null ? "transparent" :
                  (position === pos || (position === "all-corners" && pos !== "center" && pos !== null))
                    ? `${c.accent}30` : `${c.border}60`,
                border: pos === null ? "none" :
                  (position === pos || (position === "all-corners" && pos !== "center" && pos !== null))
                    ? `1px solid ${c.accent}` : `1px solid ${c.border}`,
                cursor: pos ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: c.accent, fontWeight: 700,
                transition: "all 0.15s ease",
              }}>
              {pos && (position === pos || (position === "all-corners" && pos !== "center")) ? "◆" : ""}
            </div>
          ))}
        </div>

        {/* Position buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {LOGO_POSITIONS.map(p => (
            <button key={p.id} onClick={() => onChange(p.id)}
              style={{
                background: position === p.id ? `${c.accent}15` : "transparent",
                border: position === p.id ? `1px solid ${c.accent}40` : `1px solid transparent`,
                borderRadius: 4, padding: "3px 8px", textAlign: "left",
                color: position === p.id ? c.accent : c.textMuted,
                cursor: "pointer", fontSize: 10, fontWeight: position === p.id ? 700 : 500,
                fontFamily: `'SF Pro Display', -apple-system, system-ui, sans-serif`,
                transition: "all 0.1s ease",
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QrForge() {
  const [activeTab, setActiveTab] = useState("generator");
  const [inputType, setInputType] = useState("url");
  const [content, setContent] = useState("https://mywebsite.com");
  const [dotStyle, setDotStyle] = useState("rounded");
  const [eyeStyle, setEyeStyle] = useState("rounded");
  const [fgColor, setFgColor] = useState("#1a1a2e");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showGradient, setShowGradient] = useState(false);
  const [gradFrom, setGradFrom] = useState("#1a1a2e");
  const [gradTo, setGradTo] = useState("#e94560");
  const [showLogo, setShowLogo] = useState(false);
  const [logoShape, setLogoShape] = useState("square");
  const [logoPosition, setLogoPosition] = useState("center");
  const [logoSize, setLogoSize] = useState(25);
  const [transparentBg, setTransparentBg] = useState(false);
  const [ecLevel, setEcLevel] = useState("M");
  const [exportSize, setExportSize] = useState("1024");
  const [validationState, setValidationState] = useState("idle");

  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiEnc, setWifiEnc] = useState("WPA");
  const [vcardFirst, setVcardFirst] = useState("");
  const [vcardLast, setVcardLast] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardUrl, setVcardUrl] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [geoLat, setGeoLat] = useState("");
  const [geoLng, setGeoLng] = useState("");

  // Reset validation whenever style or content changes
  useEffect(() => { setValidationState("idle"); }, [content, dotStyle, eyeStyle, fgColor, bgColor, showGradient, gradFrom, gradTo, showLogo, logoPosition, logoSize, logoShape, transparentBg, ecLevel]);

  const handleValidate = useCallback(() => {
    setValidationState("validating");
    setTimeout(() => {
      if (!content || content.length < 2) {
        setValidationState("fail");
        return;
      }
      // Simulate: logos covering corners with low EC = fail/warn
      const hasCornerLogo = showLogo && ["top-left", "top-right", "bottom-left", "all-corners"].includes(logoPosition);
      const lowEC = ecLevel === "L" || ecLevel === "M";

      if (hasCornerLogo && logoPosition === "all-corners" && lowEC) {
        setValidationState("fail");
      } else if (hasCornerLogo && lowEC) {
        setValidationState("warn");
      } else if (showLogo && logoSize > 30 && lowEC) {
        setValidationState("warn");
      } else {
        setValidationState("pass");
      }
    }, 1200);
  }, [content, showLogo, logoPosition, logoSize, ecLevel]);

  const qrStyle = {
    dotStyle, eyeStyle, foreground: fgColor, background: bgColor,
    gradient: showGradient ? { from: gradFrom, to: gradTo } : null,
    logo: showLogo, logoShape, logoPosition, logoSize, transparentBg,
  };

  const font = `'SF Mono', 'Fira Code', 'JetBrains Mono', monospace`;
  const fontSans = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

  const c = {
    bg: "#0c0c10", surface: "#141419", surfaceHover: "#1c1c24",
    border: "#252530", borderLight: "#2a2a38",
    text: "#e8e8ed", textMuted: "#8888a0", textDim: "#555568",
    accent: "#f59e0b", success: "#22c55e", danger: "#ef4444",
  };

  const buildVcard = (f, l, o, p, e, u) => {
    let s = `BEGIN:VCARD\nVERSION:3.0\nN:${l};${f}\nFN:${f} ${l}`;
    if (o) s += `\nORG:${o}`; if (p) s += `\nTEL:${p}`;
    if (e) s += `\nEMAIL:${e}`; if (u) s += `\nURL:${u}`;
    return s + `\nEND:VCARD`;
  };

  const is = inputStyle(c, font);

  const renderInputFields = () => {
    switch (inputType) {
      case "wifi":
        return (<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input value={wifiSsid} onChange={e => { setWifiSsid(e.target.value); setContent(`WIFI:T:${wifiEnc};S:${e.target.value};P:${wifiPass};;`); }} placeholder="Network name (SSID)" style={is} />
          <input value={wifiPass} onChange={e => { setWifiPass(e.target.value); setContent(`WIFI:T:${wifiEnc};S:${wifiSsid};P:${e.target.value};;`); }} placeholder="Password" type="password" style={is} />
          <select value={wifiEnc} onChange={e => { setWifiEnc(e.target.value); setContent(`WIFI:T:${e.target.value};S:${wifiSsid};P:${wifiPass};;`); }} style={{ ...is, cursor: "pointer" }}>
            <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No Password</option>
          </select>
        </div>);
      case "vcard":
        return (<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={vcardFirst} onChange={e => { setVcardFirst(e.target.value); setContent(buildVcard(e.target.value, vcardLast, vcardOrg, vcardPhone, vcardEmail, vcardUrl)); }} placeholder="First name" style={is} />
            <input value={vcardLast} onChange={e => { setVcardLast(e.target.value); setContent(buildVcard(vcardFirst, e.target.value, vcardOrg, vcardPhone, vcardEmail, vcardUrl)); }} placeholder="Last name" style={is} />
          </div>
          <input value={vcardOrg} onChange={e => { setVcardOrg(e.target.value); setContent(buildVcard(vcardFirst, vcardLast, e.target.value, vcardPhone, vcardEmail, vcardUrl)); }} placeholder="Organization" style={is} />
          <input value={vcardPhone} onChange={e => { setVcardPhone(e.target.value); setContent(buildVcard(vcardFirst, vcardLast, vcardOrg, e.target.value, vcardEmail, vcardUrl)); }} placeholder="Phone" style={is} />
          <input value={vcardEmail} onChange={e => { setVcardEmail(e.target.value); setContent(buildVcard(vcardFirst, vcardLast, vcardOrg, vcardPhone, e.target.value, vcardUrl)); }} placeholder="Email" style={is} />
          <input value={vcardUrl} onChange={e => { setVcardUrl(e.target.value); setContent(buildVcard(vcardFirst, vcardLast, vcardOrg, vcardPhone, vcardEmail, e.target.value)); }} placeholder="Website" style={is} />
        </div>);
      case "email":
        return (<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input value={emailTo} onChange={e => { setEmailTo(e.target.value); setContent(`mailto:${e.target.value}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`); }} placeholder="Recipient email" style={is} />
          <input value={emailSubject} onChange={e => { setEmailSubject(e.target.value); setContent(`mailto:${emailTo}?subject=${encodeURIComponent(e.target.value)}&body=${encodeURIComponent(emailBody)}`); }} placeholder="Subject" style={is} />
          <textarea value={emailBody} onChange={e => { setEmailBody(e.target.value); setContent(`mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(e.target.value)}`); }} placeholder="Body" rows={2} style={{ ...is, resize: "vertical" }} />
        </div>);
      case "geo":
        return (<div style={{ display: "flex", gap: 6 }}>
          <input value={geoLat} onChange={e => { setGeoLat(e.target.value); setContent(`geo:${e.target.value},${geoLng}`); }} placeholder="Latitude" style={is} />
          <input value={geoLng} onChange={e => { setGeoLng(e.target.value); setContent(`geo:${geoLat},${e.target.value}`); }} placeholder="Longitude" style={is} />
        </div>);
      case "sms":
        return (<input onChange={e => setContent(`sms:${e.target.value}`)} placeholder="Phone number" style={is} />);
      default:
        return (<textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder={inputType === "url" ? "https://example.com" : inputType === "phone" ? "+1 555-0123" : inputType === "calendar" ? "Event title, date, location..." : "Enter your text..."}
          rows={3} style={{ ...is, resize: "vertical", minHeight: 60 }} />);
    }
  };

  return (
    <div style={{
      fontFamily: fontSans, background: c.bg, color: c.text,
      height: "100vh", display: "flex", flexDirection: "column",
      fontSize: 13, overflow: "hidden", borderRadius: 12, border: `1px solid ${c.border}`,
    }}>
      {/* Title Bar */}
      <div style={{
        height: 46, background: c.surface, borderBottom: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 7, marginRight: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{
            fontFamily: font, fontSize: 14, fontWeight: 700, letterSpacing: -0.5,
            background: `linear-gradient(135deg, ${c.accent}, #ef4444)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>◧ QR Forge</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Panel */}
        <div style={{
          width: 280, borderRight: `1px solid ${c.border}`,
          display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
        }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
            {activeTab === "generator" && (<>
              {/* Input Type */}
              <div style={{ marginBottom: 16 }}>
                <div style={secLbl(c)}>Content Type</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                  {INPUT_TYPES.map(t => (
                    <button key={t.id} onClick={() => { setInputType(t.id); setContent(""); }}
                      style={{
                        background: inputType === t.id ? `linear-gradient(135deg, ${c.accent}20, ${c.accent}10)` : c.surfaceHover,
                        border: inputType === t.id ? `1px solid ${c.accent}50` : `1px solid ${c.border}`,
                        borderRadius: 6, padding: "7px 4px",
                        color: inputType === t.id ? c.accent : c.textMuted,
                        cursor: "pointer", fontSize: 10, fontWeight: 600,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                        fontFamily: fontSans, transition: "all 0.15s ease",
                      }}>
                      <span style={{ fontSize: 14 }}>{t.icon}</span><span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div style={{ marginBottom: 16 }}>
                <div style={secLbl(c)}>Content</div>
                {renderInputFields()}
                <div style={{ fontSize: 10, color: c.textDim, marginTop: 4, fontFamily: font }}>{content.length} chars</div>
              </div>

              <div style={{ height: 1, background: c.border, margin: "4px 0 14px" }} />

              {/* Style */}
              <div>
                <div style={secLbl(c)}>Style</div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6 }}>Dot Style</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {DOT_STYLES.map(s => (<button key={s.id} onClick={() => setDotStyle(s.id)} title={s.name} style={iBtn(dotStyle === s.id, c)}>{s.label}</button>))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6 }}>Eye Style</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {EYE_STYLES.map(s => (<button key={s.id} onClick={() => setEyeStyle(s.id)} title={s.name} style={iBtn(eyeStyle === s.id, c)}>{s.label}</button>))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6 }}>Colors</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Sw label="FG" value={fgColor} onChange={setFgColor} c={c} />
                    <Sw label="BG" value={bgColor} onChange={setBgColor} c={c} />
                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: c.textMuted, cursor: "pointer", marginLeft: 4 }}>
                      <input type="checkbox" checked={transparentBg} onChange={e => setTransparentBg(e.target.checked)} style={{ accentColor: c.accent }} />
                      Transparent
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: c.textMuted, cursor: "pointer" }}>
                    <input type="checkbox" checked={showGradient} onChange={e => setShowGradient(e.target.checked)} style={{ accentColor: c.accent }} />
                    Gradient Fill
                  </label>
                  {showGradient && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                      <Sw value={gradFrom} onChange={setGradFrom} c={c} small />
                      <span style={{ fontSize: 11, color: c.textDim }}>→</span>
                      <Sw value={gradTo} onChange={setGradTo} c={c} small />
                    </div>
                  )}
                </div>

                {/* Enhanced Logo Section */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: c.textMuted, cursor: "pointer" }}>
                    <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} style={{ accentColor: c.accent }} />
                    Embed Image / Logo
                  </label>
                  {showLogo && (
                    <div style={{ marginTop: 8 }}>
                      {/* Drop zone */}
                      <div style={{
                        border: `2px dashed ${c.borderLight}`, borderRadius: 8,
                        padding: "12px 10px", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 4, cursor: "pointer", marginBottom: 10,
                        transition: "border-color 0.2s",
                      }}>
                        <span style={{ fontSize: 18, opacity: 0.4 }}>+</span>
                        <span style={{ fontSize: 10, color: c.textDim }}>Drop logo or image here</span>
                        <span style={{ fontSize: 9, color: c.textDim }}>PNG, JPG, SVG — will auto-resize</span>
                      </div>

                      {/* Shape */}
                      <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 5 }}>Shape</div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => setLogoShape("square")} style={{ ...chip(logoShape === "square", c), fontFamily: fontSans }}>□ Square</button>
                        <button onClick={() => setLogoShape("circle")} style={{ ...chip(logoShape === "circle", c), fontFamily: fontSans }}>○ Circle</button>
                      </div>

                      {/* Position Picker */}
                      <LogoPositionPicker position={logoPosition} onChange={setLogoPosition} c={c} />

                      {/* Size Slider */}
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: c.textMuted }}>Size</span>
                          <span style={{ fontSize: 10, color: c.textDim, fontFamily: font }}>{logoSize}%</span>
                        </div>
                        <input type="range" min="10" max="40" value={logoSize}
                          onChange={e => setLogoSize(Number(e.target.value))}
                          style={{ width: "100%", accentColor: c.accent, height: 4 }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: c.textDim, marginTop: 2 }}>
                          <span>Small</span><span>Large</span>
                        </div>
                        {logoSize > 30 && (
                          <div style={{
                            fontSize: 9, color: c.accent, marginTop: 4,
                            padding: "3px 6px", background: `${c.accent}10`,
                            borderRadius: 4, border: `1px solid ${c.accent}20`,
                          }}>
                            ⚠ Large logos may reduce scanability — use EC level Q or H
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Correction */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6 }}>Error Correction</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["L", "M", "Q", "H"].map(lv => (
                      <button key={lv} onClick={() => setEcLevel(lv)}
                        style={{ ...chip(ecLevel === lv, c), fontFamily: font, width: 36, fontSize: 12, fontWeight: 700 }}>
                        {lv}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: c.textDim, marginTop: 4 }}>
                    {ecLevel === "L" && "7% recovery — smallest code"}
                    {ecLevel === "M" && "15% recovery — recommended"}
                    {ecLevel === "Q" && "25% recovery — good with logo"}
                    {ecLevel === "H" && "30% recovery — best with logo"}
                  </div>
                  {showLogo && (ecLevel === "L" || ecLevel === "M") && (
                    <div style={{
                      fontSize: 9, color: c.accent, marginTop: 4,
                      padding: "3px 6px", background: `${c.accent}10`,
                      borderRadius: 4, border: `1px solid ${c.accent}20`,
                    }}>
                      💡 Tip: Use Q or H when embedding a logo for best results
                    </div>
                  )}
                </div>
              </div>
            </>)}

            {activeTab === "scanner" && (
              <div>
                <div style={secLbl(c)}>Scan QR Code</div>
                <div style={{
                  border: `2px dashed ${c.borderLight}`, borderRadius: 10,
                  padding: "36px 16px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, cursor: "pointer",
                }}>
                  <span style={{ fontSize: 28, opacity: 0.4 }}>⊞</span>
                  <span style={{ fontSize: 12, color: c.textMuted }}>Drop QR image here</span>
                  <span style={{ fontSize: 10, color: c.textDim }}>or paste from clipboard (⌘V)</span>
                </div>
                <div style={{ marginTop: 20, padding: 14, background: c.surfaceHover, borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <div style={{ fontSize: 10, color: c.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Decoded Content</div>
                  <div style={{ fontFamily: font, fontSize: 12, color: c.textMuted, fontStyle: "italic" }}>No QR code scanned yet</div>
                </div>
              </div>
            )}

            {activeTab === "batch" && (
              <div>
                <div style={secLbl(c)}>Batch Generation</div>
                <div style={{
                  border: `2px dashed ${c.borderLight}`, borderRadius: 10,
                  padding: "30px 16px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, cursor: "pointer",
                }}>
                  <span style={{ fontSize: 28, opacity: 0.4 }}>▤</span>
                  <span style={{ fontSize: 12, color: c.textMuted }}>Drop CSV file here</span>
                  <span style={{ fontSize: 10, color: c.textDim }}>Columns: content, type, label</span>
                </div>
                <div style={{
                  marginTop: 14, padding: 10, background: c.surfaceHover, borderRadius: 8,
                  border: `1px solid ${c.border}`, fontSize: 10, color: c.textDim, fontFamily: font, lineHeight: 1.6,
                }}>
                  <div style={{ marginBottom: 2 }}>Example CSV:</div>
                  <div style={{ color: c.textMuted }}>content,type,label</div>
                  <div style={{ color: c.textMuted }}>https://shop.io,url,Homepage</div>
                  <div style={{ color: c.textMuted }}>+15550123,phone,Support</div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <div style={secLbl(c)}>Recent Codes</div>
                <input placeholder="Search history..." style={{ ...is, marginBottom: 10 }} />
                {[
                  { content: "https://mywebsite.com", type: "url", time: "2 min ago" },
                  { content: "WIFI:T:WPA;S:HomeNet;P:****;;", type: "wifi", time: "1 hour ago" },
                  { content: "+1 555-0199", type: "phone", time: "Yesterday" },
                  { content: "BEGIN:VCARD...", type: "vcard", time: "3 days ago" },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", background: c.surfaceHover, borderRadius: 8,
                    border: `1px solid ${c.border}`, marginBottom: 6, cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 11, fontFamily: font, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.content}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: c.textDim }}>
                      <span style={{ background: `${c.accent}15`, color: c.accent, padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: 600 }}>{item.type.toUpperCase()}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "templates" && (
              <div>
                <div style={{ ...secLbl(c), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Templates
                  <button style={{
                    background: `${c.accent}20`, border: `1px solid ${c.accent}40`, color: c.accent,
                    borderRadius: 5, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: fontSans, fontWeight: 600,
                  }}>+ Save Current</button>
                </div>
                {[
                  { name: "Brand Primary", fg: "#1a1a2e", bg: "#ffffff", dot: "rounded", desc: "Default brand, rounded dots" },
                  { name: "Dark Mode", fg: "#e8e8ed", bg: "#1a1a2e", dot: "dots", desc: "Light on dark, circles" },
                  { name: "Sunset", fg: "#ef4444", bg: "#fef3c7", dot: "diamond", desc: "Warm red on cream" },
                  { name: "Ocean", fg: "#0ea5e9", bg: "#f0f9ff", dot: "rounded", desc: "Blue tones, rounded" },
                ].map((tmpl, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", background: c.surfaceHover, borderRadius: 8,
                    border: `1px solid ${c.border}`, marginBottom: 6, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 6, background: tmpl.bg,
                      border: `2px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <div style={{
                        width: 14, height: 14, background: tmpl.fg,
                        borderRadius: tmpl.dot === "dots" ? "50%" : tmpl.dot === "diamond" ? 0 : 2,
                        transform: tmpl.dot === "diamond" ? "rotate(45deg) scale(0.7)" : "none",
                      }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{tmpl.name}</div>
                      <div style={{ fontSize: 9, color: c.textDim }}>{tmpl.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, gap: 16, background: `radial-gradient(ellipse at center, ${c.surfaceHover} 0%, ${c.bg} 70%)`,
          overflow: "auto",
        }}>
          {activeTab === "generator" && (<>
            <div style={{
              background: c.surface, borderRadius: 16, padding: 24,
              border: `1px solid ${c.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
            }}>
              <QrPreview config={{ content, type: inputType }} style={qrStyle} validationState={validationState} />
            </div>

            <div style={{ display: "flex", gap: 16, fontSize: 10, color: c.textDim, fontFamily: font }}>
              <span>Size: {exportSize}×{exportSize}</span>
              <span>EC: {ecLevel} ({ecLevel === "L" ? "7%" : ecLevel === "M" ? "15%" : ecLevel === "Q" ? "25%" : "30%"})</span>
              <span>Type: {inputType.toUpperCase()}</span>
            </div>

            {/* Validation */}
            <ValidationBadge state={validationState} onValidate={handleValidate} />

            <div style={{ display: "flex", gap: 4 }}>
              {["512", "1024", "2048", "4096"].map(s => (
                <button key={s} onClick={() => setExportSize(s)}
                  style={{ ...chip(exportSize === s, c), fontFamily: font, fontSize: 10 }}>{s}px</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { label: "Copy", icon: "📋" },
                { label: "PNG", icon: "🖼" },
                { label: "SVG", icon: "◇" },
                { label: "PDF", icon: "📄" },
                { label: "Web Pack", icon: "🌐" },
              ].map(btn => (
                <button key={btn.label} style={eBtn(c)}>
                  <span style={{ fontSize: 14 }}>{btn.icon}</span> {btn.label}
                </button>
              ))}
            </div>
          </>)}

          {activeTab === "scanner" && (
            <div style={{ textAlign: "center", color: c.textDim }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 12, opacity: 0.3 }}>⊞</span>
              <div style={{ fontSize: 14, color: c.textMuted }}>Drop a QR code image to scan</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Supports PNG, JPG, SVG, and clipboard</div>
            </div>
          )}
          {activeTab === "batch" && (
            <div style={{ textAlign: "center", color: c.textDim, maxWidth: 360 }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 12, opacity: 0.3 }}>▤</span>
              <div style={{ fontSize: 14, color: c.textMuted }}>Import a CSV to batch generate QR codes</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Each row becomes a styled QR code, exported as a ZIP</div>
              <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center" }}>
                <button style={eBtn(c)}>📁 Download ZIP</button>
                <button style={eBtn(c)}>📂 Export to Folder</button>
              </div>
            </div>
          )}
          {activeTab === "history" && (
            <div style={{ textAlign: "center", color: c.textDim }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 12, opacity: 0.3 }}>↻</span>
              <div style={{ fontSize: 14, color: c.textMuted }}>Select a code from history to preview</div>
            </div>
          )}
          {activeTab === "templates" && (
            <div style={{ textAlign: "center", color: c.textDim }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 12, opacity: 0.3 }}>◫</span>
              <div style={{ fontSize: 14, color: c.textMuted }}>Select a template to preview</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        height: 42, background: c.surface, borderTop: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexShrink: 0, padding: "0 8px",
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? `${c.accent}15` : "transparent",
              border: activeTab === tab.id ? `1px solid ${c.accent}30` : "1px solid transparent",
              borderRadius: 6, padding: "5px 14px",
              color: activeTab === tab.id ? c.accent : c.textMuted,
              cursor: "pointer", fontSize: 11, fontWeight: activeTab === tab.id ? 700 : 500,
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: fontSans, transition: "all 0.15s ease",
            }}>
            <span style={{ fontSize: 13 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Sw({ label, value, onChange, c, small }) {
  const sz = small ? 28 : 32;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
      <div style={{ width: sz, height: sz, borderRadius: 6, border: `2px solid ${c.borderLight}`, overflow: "hidden", position: "relative" }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ position: "absolute", inset: -6, width: "150%", height: "150%", cursor: "pointer", border: "none" }} />
      </div>
      {label && <span style={{ fontSize: 9, color: c.textDim }}>{label}</span>}
    </div>
  );
}
function secLbl(c) { return { fontSize: 10, fontWeight: 700, color: c.textMuted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }; }
function inputStyle(c, font) { return { width: "100%", background: c.surfaceHover, border: `1px solid ${c.border}`, borderRadius: 6, padding: "8px 10px", color: c.text, fontSize: 12, fontFamily: font, outline: "none", boxSizing: "border-box" }; }
function chip(a, c) { return { background: a ? `${c.accent}20` : c.surfaceHover, border: a ? `1px solid ${c.accent}60` : `1px solid ${c.border}`, borderRadius: 6, padding: "5px 10px", color: a ? c.accent : c.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 600 }; }
function iBtn(a, c) { return { width: 36, height: 36, background: a ? `${c.accent}20` : c.surfaceHover, border: a ? `1px solid ${c.accent}60` : `1px solid ${c.border}`, borderRadius: 6, color: a ? c.accent : c.textMuted, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }; }
function eBtn(c) { return { background: c.surfaceHover, border: `1px solid ${c.border}`, borderRadius: 8, padding: "8px 14px", color: c.text, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: `'SF Pro Display', -apple-system, system-ui, sans-serif` }; }
