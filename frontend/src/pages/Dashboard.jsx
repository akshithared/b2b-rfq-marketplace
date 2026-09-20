import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function Dashboard() {
  const { user } = useAuth();
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

  // Supplier Bid State
  const [activeRfqId, setActiveRfqId] = useState(null);
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Buyer Quotes View State
  const [selectedRfqQuotes, setSelectedRfqQuotes] = useState(null);
  const [quotesList, setQuotesList] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    fetchRFQs();
  }, [search]);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/rfqs${search ? `?search=${search}` : ""}`);
      setRfqs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRFQ = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/rfqs", {
        title,
        description,
        quantity: parseInt(quantity),
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

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setSubmittingQuote(true);
    try {
      await API.post("/quotes", {
        rfq_id: activeRfqId,
        price: parseFloat(price),
        delivery_days: parseInt(deliveryDays),
        notes,
      });
      alert("Quote submitted successfully!");
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

  const viewQuotesForRFQ = async (rfqId) => {
    setLoadingQuotes(true);
    setSelectedRfqQuotes(rfqId);
    try {
      const res = await API.get(`/quotes/rfq/${rfqId}`);
      setQuotesList(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  return (
    <div className="container">
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.02em" }}>
            {user.role === "BUYER" ? "Buyer Workspace" : "Supplier Opportunity Hub"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
            Account: <strong>{user.email}</strong>
          </p>
        </div>
        <span className={`badge badge-${user.role.toLowerCase()}`} style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
          Role: {user.role}
        </span>
      </div>

      {/* ==================== BUYER WORKSPACE ==================== */}
      {user.role === "BUYER" && (
        <div>
          <div className="card">
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "6px" }}>Post New RFQ</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "20px" }}>
              Submit specifications to receive quotes from verified suppliers.
            </p>

            <form onSubmit={handleCreateRFQ}>
              <div className="form-group">
                <label>Product or Service Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 500 Units High-Grade Steel Valves"
                />
              </div>

              <div className="form-group">
                <label>Requirement Description</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide technical requirements, certifications needed, or packaging requests..."
                ></textarea>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 500"
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Location</label>
                  <input
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="e.g., Chicago Warehouse 4"
                  />
                </div>

                <div className="form-group">
                  <label>RFQ Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} disabled={submitting}>
                {submitting ? "Publishing Request..." : "Post RFQ to Marketplace"}
              </button>
            </form>
          </div>

          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "32px 0 16px" }}>Your Submitted Requests</h3>

          {loading ? (
            <div className="empty-state">
              <p>Fetching your RFQs...</p>
            </div>
          ) : rfqs.length === 0 ? (
            <div className="empty-state">
              <h4>No Active Requests</h4>
              <p style={{ marginTop: "6px" }}>You have not posted any RFQs yet. Fill out the form above to start receiving bids.</p>
            </div>
          ) : (
            <div className="grid">
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="card card-interactive" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div className="rfq-card-header">
                      <h4 className="rfq-title">{rfq.title}</h4>
                    </div>

                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "8px 0 16px", minHeight: "40px" }}>
                      {rfq.description}
                    </p>

                    <div className="rfq-meta">
                      <div><strong>Quantity:</strong> {rfq.quantity} units</div>
                      <div><strong>Location:</strong> {rfq.delivery_location}</div>
                      <div><strong>Deadline:</strong> {new Date(rfq.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => viewQuotesForRFQ(rfq.id)}
                    className="btn btn-secondary"
                    style={{ width: "100%", marginTop: "12px" }}
                  >
                    View Received Bids
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* RECEIVED BIDS PANEL */}
          {selectedRfqQuotes && (
            <div className="card" style={{ marginTop: "32px", borderLeft: "4px solid var(--primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Supplier Bids Received</h3>
                <button onClick={() => setSelectedRfqQuotes(null)} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "0.8rem" }}>
                  Close Panel
                </button>
              </div>

              {loadingQuotes ? (
                <p style={{ color: "var(--text-muted)" }}>Loading supplier quotes...</p>
              ) : quotesList.length === 0 ? (
                <div style={{ padding: "20px 0", color: "var(--text-muted)" }}>
                  No quotations have been submitted for this request yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {quotesList.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-main)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div>
                          <strong>{q.supplier_name}</strong>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "8px" }}>({q.supplier_email})</span>
                        </div>
                        <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)" }}>${q.price}</span>
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", display: "flex", gap: "20px" }}>
                        <span><strong>Delivery:</strong> {q.delivery_days} days</span>
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

      {/* ==================== SUPPLIER WORKSPACE ==================== */}
      {user.role === "SUPPLIER" && (
        <div>
          <div className="card" style={{ padding: "16px 20px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
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
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="card card-interactive" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div className="rfq-card-header">
                      <h4 className="rfq-title">{rfq.title}</h4>
                    </div>

                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "8px 0 16px" }}>
                      {rfq.description}
                    </p>

                    <div className="rfq-meta">
                      <div><strong>Quantity Needed:</strong> {rfq.quantity} units</div>
                      <div><strong>Delivery To:</strong> {rfq.delivery_location}</div>
                      <div><strong>Deadline:</strong> {new Date(rfq.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {activeRfqId === rfq.id ? (
                    <form onSubmit={handleSubmitQuote} style={{ marginTop: "16px", background: "#f1f5f9", padding: "16px", borderRadius: "8px" }}>
                      <h5 style={{ fontWeight: "700", marginBottom: "12px", fontSize: "0.95rem" }}>Submit Quotation</h5>

                      <div className="form-group">
                        <label>Quoted Price ($)</label>
                        <input
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
                        <label>Estimated Delivery (Days)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={deliveryDays}
                          onChange={(e) => setDeliveryDays(e.target.value)}
                          placeholder="e.g. 14"
                        />
                      </div>

                      <div className="form-group">
                        <label>Message / Payment Terms</label>
                        <textarea
                          rows="2"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Include terms, warranties, or transport details..."
                        ></textarea>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingQuote}>
                          {submittingQuote ? "Sending..." : "Submit Quote"}
                        </button>
                        <button type="button" onClick={() => setActiveRfqId(null)} className="btn btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setActiveRfqId(rfq.id)} className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }}>
                      Prepare Quotation
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}