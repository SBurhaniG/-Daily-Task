import React, { useEffect, useState } from "react";

export default function Dashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Helper to get auth headers for secure requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch("http://localhost:3000/products");
        if (!response.ok) throw new Error(`Server returned error status: ${response.status}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load inventory:", error.message);
        setProducts([]); 
      }
    }
    fetchInventory();
  }, []); 

  async function handleAddProduct() {
    if (!formName || !formPrice || !formStock) {
      alert("Please fill in the Name, Price, and Stock Quantity fields.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, description: formDesc, price: parseFloat(formPrice), stockQuantity: parseInt(formStock, 10) })
      });
      if (!response.ok) throw new Error(`Server returned error status: ${response.status}`);
      const newProduct = await response.json();
      setProducts((prev) => [...prev, newProduct]);
      setFormName(""); setFormDesc(""); setFormPrice(""); setFormStock("");
    } catch (error) {
      console.error("Submission failed:", error.message);
      alert("Failed to save product.");
    }
  }

  async function handleUpdateProduct() {
    if (!editingId) return;
    try {
      const response = await fetch(`http://localhost:3000/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, description: formDesc, price: parseFloat(formPrice), stockQuantity: parseInt(formStock, 10) })
      });
      if (!response.ok) throw new Error(`Server returned error status: ${response.status}`);
      const updatedProduct = await response.json();
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      setEditingId(null); setFormName(""); setFormDesc(""); setFormPrice(""); setFormStock("");
    } catch (error) {
      console.error("Update failed:", error.message);
      alert("Failed to update product.");
    }
  }

  function startEditing(product) {
    setEditingId(product.id);
    setFormName(product.name);
    setFormDesc(product.description || "");
    setFormPrice(product.price);
    setFormStock(product.stockQuantity);
  }

  function cancelEditing() {
    setEditingId(null); setFormName(""); setFormDesc(""); setFormPrice(""); setFormStock("");
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`http://localhost:3000/products/${productId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Server returned status: ${response.status}`);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Delete request failed:", error.message);
      alert("Could not remove product.");
    }
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>Warehouse Operations</h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Welcome, {user?.name || user?.email} ({user?.role})</p>
        </div>
        <button 
          onClick={onLogout}
          style={{ padding: '10px 20px', background: '#dc2626', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          Logout
        </button>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', alignItems: 'start' }}>
        <aside style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
            {editingId ? "Edit Existing Asset" : "Add New Asset"}
          </h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#9ca3af' }}>Item Name</label>
              <input type="text" placeholder="e.g., Industrial Router" value={formName} onChange={(e) => setFormName(e.target.value)} style={{ padding: '10px 14px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#9ca3af' }}>Specification / Description</label>
              <input type="text" placeholder="Optional specifications" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} style={{ padding: '10px 14px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9ca3af' }}>Unit Price ($)</label>
                <input type="number" step="0.01" placeholder="0.00" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} style={{ padding: '10px 14px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#9ca3af' }}>Initial Units</label>
                <input type="number" placeholder="0" value={formStock} onChange={(e) => setFormStock(e.target.value)} style={{ padding: '10px 14px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {editingId && (
                <button type="button" onClick={cancelEditing} style={{ flex: 1, padding: '12px', background: '#374151', border: 'none', color: '#fff', fontWeight: '600', fontSize: '14px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              )}
              <button type="button" onClick={editingId ? handleUpdateProduct : handleAddProduct} style={{ flex: editingId ? 2 : 1, padding: '12px', background: editingId ? '#059669' : '#2563eb', border: 'none', color: '#ffffff', fontWeight: '600', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}>
                {editingId ? "Update Product" : "Register Product"}
              </button>
            </div>
          </form>
        </aside>

        <main style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2937' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>Active Catalog Inventory</h3>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>No active assets found in records database.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1f2937', color: '#9ca3af', borderBottom: '1px solid #374151' }}>
                    <th style={{ padding: '14px 24px', fontWeight: '600' }}>Product Name</th>
                    <th style={{ padding: '14px 24px', fontWeight: '600' }}>Description</th>
                    <th style={{ padding: '14px 24px', fontWeight: '600', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '14px 24px', fontWeight: '600', textAlign: 'right' }}>Availability</th>
                    <th style={{ padding: '14px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #1f2937', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1a2234'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 24px', fontWeight: '500', color: '#ffffff' }}>{product.name}</td>
                      <td style={{ padding: '16px 24px', color: '#9ca3af' }}>{product.description || '—'}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#f3f4f6' }}>${parseFloat(product.price).toFixed(2)}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: product.stockQuantity > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: product.stockQuantity > 0 ? '#10b981' : '#ef4444' }}>
                          {product.stockQuantity} units
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={() => startEditing(product)} style={{ padding: '6px 12px', background: '#4b5563', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', marginRight: '8px' }}>Edit</button>
                        <button type="button" onClick={() => handleDeleteProduct(product.id)} style={{ padding: '6px 14px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}