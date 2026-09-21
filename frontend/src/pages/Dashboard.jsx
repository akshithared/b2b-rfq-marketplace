import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axios";

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Buyer Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Buyer Edit RFQ State
  const [editingRfqId, setEditingRfqId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editDeliveryLocation, setEditDeliveryLocation] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  // Supplier Bid State
  const [activeRfqId, setActiveRfqId] = useState(null);
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Supplier My Quotes State (localStorage తో నిల్వ ఉంచబడుతుంది)
  const [myQuotes, setMyQuotes] = useState(() => {
    try {
      const saved = localStorage.getItem("supplier_my_quotes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [loadingMyQuotes, setLoadingMyQuotes] = useState(false);
  const [activeTab, setActiveTab] = useState("marketplace");

  // Buyer Quotes View State
  const [selectedRfqQuotes, setSelectedRfqQuotes] = useState(null);
  const [quotesList, setQuotesList] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Fetch RFQs
  const fetchRFQs = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = search ? `/rfqs?search=${encodeURIComponent(search)}` : "/rfqs";
      const res = await API.get(endpoint);
      setRfqs(res.data.data || res.data.rfqs || res.data || []);
    } catch (err) {
      console.error("Error fetching RFQs:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Fetch Supplier Quotes from Backend and sync with localStorage
  const fetchSupplierQuotes = useCallback(async () => {
    setLoadingMyQuotes(true);
    try {
      const res = await API.get("/quotes/supplier");
      const apiQuotes = res.data.data || res.data || [];
      if (apiQuotes.length > 0) {
        setMyQuotes(apiQuotes);
        localStorage.setItem("supplier_my_quotes", JSON.stringify(apiQuotes));
      }
    } catch (err) {
      console.error("Error fetching supplier quotes from API, using local storage cache:", err);
    } finally {
      setLoadingMyQuotes(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRFQs();
      if (user.role === "SUPPLIER") {
        fetchSupplierQuotes();
      }
    }

    const onFocus = () => {
      if (user) {
        fetchRFQs();
        if (user.role === "SUPPLIER") fetchSupplierQuotes();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, fetchRFQs, fetchSupplierQuotes]);

  // LocalStorage లో మై కోటేషన్స్ మారినప్పుడల్లా సేవ్ అవ్వడానికి
  useEffect(() => {
    try {
      localStorage.setItem("supplier_my_quotes", JSON.stringify(myQuotes));
    } catch (e) {
      console.error("Failed to save quotes locally", e);
    }
  }, [myQuotes]);

  // Handle Create RFQ (Buyer)
  const handleCreateRFQ = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/rfqs", {
        title,
        description,
        quantity: parseInt(quantity, 10),
        delivery_location: deliveryLocation,
        deadline,
      });
      setTitle("");
      setDescription("");
      setQuantity("");
      setDeliveryLocation("");
      setDeadline("");
      fetchRFQs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create RFQ");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditRfq = (rfq) => {
    setEditingRfqId(rfq.id);
    setEditTitle(rfq.title || "");
    setEditDescription(rfq.description || "");
    setEditQuantity(rfq.quantity || "");
    setEditDeliveryLocation(rfq.delivery_location || "");
    setEditDeadline(rfq.deadline ? rfq.deadline.split("T")[0] : "");
  };

  const handleUpdateRfq = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/rfqs/${editingRfqId}`, {
        title: editTitle,
        description: editDescription,
        quantity: parseInt(editQuantity, 10),
        delivery_location: editDeliveryLocation,
        deadline: editDeadline,
      });
      alert("RFQ updated successfully!");
      setEditingRfqId(null);
      fetchRFQs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update RFQ");
    }
  };

  const handleDeleteRfq = async (rfqId) => {
    if (!window.confirm("Are you sure you want to delete this RFQ?")) return;
    try {
      await API.delete(`/rfqs/${rfqId}`);
      setRfqs((prevRfqs) => prevRfqs.filter((rfq) => rfq.id !== rfqId));
      if (selectedRfqQuotes === rfqId) setSelectedRfqQuotes(null);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Server error deleting RFQ.";
      if (status === 404) {
        setRfqs((prevRfqs) => prevRfqs.filter((rfq) => rfq.id !== rfqId));
      } else {
        alert(message);
      }
    }
  };

  // Handle Submit Quote (Supplier)
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setSubmittingQuote(true);
    try {
      const targetRfq = rfqs.find((r) => r.id === activeRfqId);
      const res = await API.post("/quotes", {
        rfq_id: activeRfqId,
        price: parseFloat(price),
        delivery_days: parseInt(deliveryDays, 10),
        notes,
      });

      alert("Quotation saved successfully!");

      const newQuote = res.data.data || {
        id: res.data.id || Date.now(),
        rfq_id: activeRfqId,
        price: parseFloat(price),
        delivery_days: parseInt(deliveryDays, 10),
        notes,
        rfq_title: targetRfq?.title || "RFQ Opportunity",
        delivery_location: targetRfq?.delivery_location || "N/A",
      };

      setMyQuotes((prev) => {
        const exists = prev.some((q) => q.rfq_id === activeRfqId);
        if (exists) {
          return prev.map((q) => (q.rfq_id === activeRfqId ? newQuote : q));
        }
        return [newQuote, ...prev];
      });

      setActiveRfqId(null);
      setPrice("");
      setDeliveryDays("");
      setNotes("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit quote");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const startEditQuote = (rfqId) => {
    const existingQuote = myQuotes.find((q) => q.rfq_id === rfqId);
    if (existingQuote) {
      setPrice(existingQuote.price || "");
      setDeliveryDays(existingQuote.delivery_days || "");
      setNotes(existingQuote.notes || "");
    } else {
      setPrice("");
      setDeliveryDays("");
      setNotes("");
    }
    setActiveRfqId(rfqId);
  };

  const viewQuotesForRFQ = async (rfqId) => {
    setLoadingQuotes(true);
    setSelectedRfqQuotes(rfqId);
    try {
      const res = await API.get(`/quotes/rfq/${rfqId}`);
      setQuotesList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container" style={{ padding: "40px 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading workspace credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "60px" }}>
        <p style={{ color: "var(--text-muted)" }}>Please sign in to access your workspace.</p>
      </div>
    );
  }

  const role = user?.role || "BUYER";

  return (
    <div className="container">
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.02em" }}>
            {role === "BUYER" ? "Buyer Workspace" : "Supplier Opportunity Hub"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
            Account: <strong>{user?.email || "Authenticated User"}</strong>
          </p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className={`badge badge-${role.toLowerCase()}`} style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
            Role: {role}
          </span>
          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ 
              fontSize: "0.85rem", 
              padding: "6px 14px", 
              backgroundColor: "#fee2e2", 
              color: "#b91c1c", 
              border: "1px solid #fca5a5",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* SUPPLIER WORKSPACE */}
      {role === "SUPPLIER" && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`btn ${activeTab === "marketplace" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1 }}
            >
              Marketplace Opportunities
            </button>
            <button
              onClick={() => {
                setActiveTab("my-quotes");
                fetchSupplierQuotes();
              }}
              className={`btn ${activeTab === "my-quotes" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1 }}
            >
              My Submitted Quotations ({myQuotes.length})
            </button>
          </div>

          {activeTab === "marketplace" ? (
            <div>
              <div className="card" style={{ padding: "16px 20px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="rfq-search-input">Filter Marketplace RFQs</label>
                  <input
                    id="rfq-search-input"
                    name="search"
                    type="text"
                    placeholder="Search active RFQs by product name or keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "24px 0 16px" }}>Open Marketplace Opportunities</h3>

              {loading ? (
                <div className="empty-state">
                  <p>Searching marketplace requests...</p>
                </div>
              ) : rfqs.length === 0 ? (
                <div className="empty-state">
                  <h4>No Opportunities Found</h4>
                  <p style={{ marginTop: "6px" }}>No open RFQs match your current search terms.</p>
                </div>
              ) : (
                <div className="grid">
                  {rfqs.map((rfq) => {
                    const existingQuote = myQuotes.find((q) => q.rfq_id === rfq.id);

                    return (
                      <div key={rfq.id} className="card card-interactive" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div className="rfq-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <h4 className="rfq-title">{rfq.title}</h4>
                            {existingQuote && (
                              <span className="badge" style={{ background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", padding: "2px 8px" }}>
                                Quote Submitted
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "8px 0 16px" }}>
                            {rfq.description}
                          </p>

                          <div className="rfq-meta">
                            <div><strong>Quantity Needed:</strong> {rfq.quantity} units</div>
                            <div><strong>Delivery To:</strong> {rfq.delivery_location}</div>
                            <div><strong>Deadline:</strong> {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "N/A"}</div>
                          </div>
                        </div>

                        {activeRfqId === rfq.id ? (
                          <form onSubmit={handleSubmitQuote} style={{ marginTop: "16px", background: "#f1f5f9", padding: "16px", borderRadius: "8px" }}>
                            <h5 style={{ fontWeight: "700", marginBottom: "12px", fontSize: "0.95rem" }}>
                              {existingQuote ? "Edit Quotation" : "Submit Quotation"}
                            </h5>

                            <div className="form-group">
                              <label htmlFor={`quote-price-${rfq.id}`}>Quoted Price ($)</label>
                              <input
                                id={`quote-price-${rfq.id}`}
                                name="price"
                                type="number"
                                required
                                min="1"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="e.g. 4500.00"
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor={`quote-days-${rfq.id}`}>Estimated Delivery (Days)</label>
                              <input
                                id={`quote-days-${rfq.id}`}
                                name="deliveryDays"
                                type="number"
                                required
                                min="1"
                                value={deliveryDays}
                                onChange={(e) => setDeliveryDays(e.target.value)}
                                placeholder="e.g. 14"
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor={`quote-notes-${rfq.id}`}>Message / Payment Terms</label>
                              <textarea
                                id={`quote-notes-${rfq.id}`}
                                name="notes"
                                rows="2"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Include terms, warranties, or transport details..."
                              ></textarea>
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingQuote}>
                                {submittingQuote ? "Saving..." : existingQuote ? "Update Quote" : "Submit Quote"}
                              </button>
                              <button type="button" onClick={() => setActiveRfqId(null)} className="btn btn-secondary">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => startEditQuote(rfq.id)}
                            className={`btn ${existingQuote ? "btn-secondary" : "btn-primary"}`}
                            style={{ width: "100%", marginTop: "12px" }}
                          >
                            {existingQuote ? "Edit Quotation" : "Prepare Quotation"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "16px 0" }}>Quotations You Have Submitted</h3>

              {myQuotes.length === 0 ? (
                <div className="empty-state">
                  <h4>No Submitted Quotations</h4>
                  <p style={{ marginTop: "6px" }}>You haven't submitted any bids yet. Browse marketplace opportunities to submit a quote.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {myQuotes.map((q) => (
                    <div key={q.id || q.rfq_id} className="card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{q.rfq_title || "RFQ Opportunity"}</h4>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Delivery Destination: {q.delivery_location || "N/A"}</p>
                        </div>
                        <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--primary)" }}>${q.price}</span>
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", gap: "24px", marginTop: "8px" }}>
                        <span><strong>Estimated Delivery:</strong> {q.delivery_days} days</span>
                        {q.notes && <span><strong>Notes:</strong> {q.notes}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BUYER WORKSPACE (కొనసాగింపు...) */}
      {role === "BUYER" && (
        <div>
          <div className="card">
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "6px" }}>Post New RFQ</h3>
            <form onSubmit={handleCreateRFQ}>
              <div className="form-group">
                <label>Product or Service Name</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., 500 Units High-Grade Steel Valves" />
              </div>
              <div className="form-group">
                <label>Requirement Description</label>
                <textarea required rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide technical requirements..."></textarea>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Delivery Location</label>
                  <input type="text" required value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>RFQ Deadline</label>
                  <input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} disabled={submitting}>
                {submitting ? "Publishing Request..." : "Post RFQ to Marketplace"}
              </button>
            </form>
          </div>

          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "32px 0 16px" }}>Your Submitted Requests</h3>
          {loading ? (
            <div className="empty-state"><p>Fetching your RFQs...</p></div>
          ) : rfqs.length === 0 ? (
            <div className="empty-state"><h4>No Active Requests</h4></div>
          ) : (
            <div className="grid">
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="card card-interactive" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h4 className="rfq-title">{rfq.title}</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "8px 0 16px" }}>{rfq.description}</p>
                    <div className="rfq-meta">
                      <div><strong>Quantity:</strong> {rfq.quantity} units</div>
                      <div><strong>Location:</strong> {rfq.delivery_location}</div>
                      <div><strong>Deadline:</strong> {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "N/A"}</div>
                    </div>
                  </div>
                  {editingRfqId === rfq.id ? (
                    <form onSubmit={handleUpdateRfq} style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginTop: "12px" }}>
                      <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      <button type="submit" className="btn btn-primary" style={{ marginTop: "8px", width: "100%" }}>Save</button>
                    </form>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button onClick={() => viewQuotesForRFQ(rfq.id)} className="btn btn-secondary" style={{ flex: 1 }}>View Bids</button>
                      <button onClick={() => startEditRfq(rfq)} className="btn btn-secondary" style={{ fontSize: "0.8rem" }}>Edit</button>
                      <button onClick={() => handleDeleteRfq(rfq.id)} className="btn btn-danger" style={{ fontSize: "0.8rem" }}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedRfqQuotes && (
            <div className="card" style={{ marginTop: "32px", borderLeft: "4px solid var(--primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Supplier Bids Received</h3>
                <button onClick={() => setSelectedRfqQuotes(null)} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "0.8rem" }}>Close</button>
              </div>
              {loadingQuotes ? <p>Loading quotes...</p> : quotesList.length === 0 ? <p>No quotes yet.</p> : (
                quotesList.map((q) => (
                  <div key={q.id} style={{ padding: "12px", border: "1px solid var(--border)", marginBottom: "8px", borderRadius: "6px" }}>
                    <strong>${q.price}</strong> - {q.supplier_email} ({q.delivery_days} days)
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}