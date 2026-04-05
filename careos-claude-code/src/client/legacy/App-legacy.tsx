import { useState, useEffect } from "react";
import Website from "./Website";
import ProductMap from "./ProductMap";
import Enzyme from "./Enzyme";
import CareUBI from "./CareUBI";
import Synthesis from "./Synthesis";
import Admin from "./Admin";
import Dashboard from "./Dashboard";
import Omaha from "./Omaha";
import AIChat from "./components/AIChat";
import { C, ff, fs, useIsMobile } from "./theme";

function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 2000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("co-op.care - Worker-Owned Home Care");
    const body = encodeURIComponent(`Check out co-op.care: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9999 }}>
      {isOpen && (
        <div style={{ position: "absolute", bottom: 60, left: 0, background: C.w, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 4, width: 200, animation: "fadeUp 0.2s ease-out" }}>
          <button onClick={handleCopy} style={{ background: "transparent", border: "none", padding: "8px 12px", textAlign: "left", fontFamily: fs, fontSize: 13, color: C.t1, cursor: "pointer", borderRadius: 4, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = C.bg} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
          <button onClick={handleEmail} style={{ background: "transparent", border: "none", padding: "8px 12px", textAlign: "left", fontFamily: fs, fontSize: 13, color: C.t1, cursor: "pointer", borderRadius: 4, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = C.bg} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
            Email to a Colleague
          </button>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: C.w, border: `1px solid ${C.border}`, color: C.t1, width: 48, height: 48, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.2s ease" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
      </button>
    </div>
  );
}

function GlobalFooter() {
  const isMobile = useIsMobile();
  return (
    <footer style={{ background: C.dk2, padding: "48px 24px", color: C.t4, marginTop: "auto" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(6, 1fr)", gap: 24, marginBottom: 48 }}>
          <a href="#website" style={{ color: C.w, textDecoration: "none", fontFamily: fs, fontSize: 14, fontWeight: 600 }}>Public Site</a>
          <a href="#master" style={{ color: C.w, textDecoration: "none", fontFamily: fs, fontSize: 14, fontWeight: 600 }}>Master Synthesis</a>
          <a href="#product" style={{ color: C.w, textDecoration: "none", fontFamily: fs, fontSize: 14, fontWeight: 600 }}>For Investors</a>
          <a href="#enzyme" style={{ color: C.w, textDecoration: "none", fontFamily: fs, fontSize: 14, fontWeight: 600 }}>Enzyme Thesis</a>
          <a href="#ubi" style={{ color: C.w, textDecoration: "none", fontFamily: fs, fontSize: 14, fontWeight: 600 }}>Care UBI</a>
          <a href="#omaha" style={{ color: C.w, textDecoration: "none", fontFamily: fs, fontSize: 14, fontWeight: 600 }}>Omaha System</a>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ fontFamily: ff, fontSize: 20, color: C.sage, fontWeight: 700, marginBottom: 16 }}>co-op.care</div>
            <div style={{ fontFamily: fs, fontSize: 13, lineHeight: 1.6 }}>
              Worker-Owned Home Care Cooperative, LLC<br/>
              Boulder, CO · 2026
            </div>
          </div>
          <div style={{ fontFamily: fs, fontSize: 13, lineHeight: 1.6 }}>
            <strong>Blaine Warkentine, MD</strong><br/>
            <a href="mailto:blaine@co-op.care" style={{ color: C.t4, textDecoration: "none" }}>blaine@co-op.care</a> · 484-684-5287<br/><br/>
            <strong>Josh Emdur, DO</strong><br/>
            Medical Director · BCH Hospitalist<br/>
            50-State Licensed
          </div>
        </div>
        <div style={{ marginTop: 32, paddingTop: 32, borderTop: `1px solid #4a453e`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: fs, fontSize: 11, lineHeight: 1.5, opacity: 0.6, flex: 1, minWidth: 250 }}>
            Disclaimer: Age at Home Care Insurance is planned for 2028+ and is not a licensed insurance product today. The $100 founding family deposit is not an insurance premium. Class A license application pending. All services subject to availability and licensing.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState("website");
  const isMobile = useIsMobile();
  
  // URL hash routing
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (["website","product","enzyme","ubi","master","admin","dashboard","omaha"].includes(hash)) setPage(hash);
    const handler = () => {
      const h = window.location.hash.slice(1);
      if (["website","product","enzyme","ubi","master","admin","dashboard","omaha"].includes(h)) setPage(h);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Stakeholder Top Bar - Hidden on the public family website */}
      {page !== "website" && page !== "dashboard" && page !== "admin" && (
        <div style={{ 
          background: C.dark, 
          padding: isMobile ? "0 12px" : "0 24px", 
          display: "flex", 
          alignItems: "center", 
          height: 48,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}>
          <span style={{ fontFamily: ff, fontSize: 16, color: C.sage, fontWeight: 600, marginRight: 24, cursor: "pointer" }} onClick={() => { setPage("website"); window.location.hash = "website"; }}>co-op.care</span>
          {[
            { id: "master", label: "Master Synthesis" },
            { id: "product", label: "For Investors" },
            { id: "enzyme", label: "Enzyme Thesis" },
            { id: "ubi", label: "Care UBI" },
            { id: "omaha", label: "Omaha System" },
          ].map(p => (
            <button key={p.id} onClick={() => { setPage(p.id); window.location.hash = p.id; }}
              style={{
                background: "none", border: "none", padding: "14px 12px",
                color: page === p.id ? C.w : C.t3,
                fontWeight: page === p.id ? 700 : 400,
                fontSize: 13, cursor: "pointer", fontFamily: fs,
                borderBottom: page === p.id ? `2px solid ${C.sage}` : "2px solid transparent",
                transition: "all 0.2s ease"
              }}>{p.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => { setPage("website"); window.location.hash = "website"; }} style={{ background: "transparent", border: `1px solid ${C.t3}`, color: C.t3, padding: "4px 12px", borderRadius: 4, fontFamily: fs, fontSize: 11, cursor: "pointer", marginLeft: 16 }}>
            ← Public Site
          </button>
        </div>
      )}
      
      <div style={{ flex: 1 }}>
        {page === "website" && <Website />}
        {page === "master" && <Synthesis />}
        {page === "product" && <ProductMap />}
        {page === "enzyme" && <Enzyme />}
        {page === "ubi" && <CareUBI />}
        {page === "admin" && <Admin />}
        {page === "dashboard" && <Dashboard />}
        {page === "omaha" && <Omaha />}
      </div>

      <AIChat />
      <ShareButton />
      {page !== "dashboard" && page !== "admin" && <GlobalFooter />}
    </div>
  );
}
