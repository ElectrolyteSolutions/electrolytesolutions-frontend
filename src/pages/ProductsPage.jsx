import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, addProduct, deleteProduct, updateProduct } from '../features/productSlice';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    quantity: '',
  });

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setForm(product);
      setEditId(product._id);
    } else {
      setForm({ name: '', price: '', quantity: ''});
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateProduct({ id: editId, data: form }));
    } else {
      dispatch(addProduct(form));
    }
    handleCloseModal();
  };

  // --- Styled Components (Internal) ---
  const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    addBtn: { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
    th: { textAlign: 'left', padding: '15px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' },
    td: { padding: '15px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#f1f5f9', color: '#475569' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Product Inventory</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Manage and track your electrolyte solutions stock.</p>
        </div>
        <button style={styles.addBtn} onClick={() => handleOpenModal()}>+ Add Product</button>
      </header>

      {status === 'loading' ? (
        <p>Synchronizing data...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>S.No</th>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p,i) => (
              <tr key={p._id} style={styles.tr}>
                <td style={{ ...styles.td, borderLeft: '1px solid #f1f5f9', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{i+1}</div>
                  {/* <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.name}</div> */}
                </td>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>${p.price}</td>
                <td style={styles.td}>
                  <span style={{ color: p.quantity < 10 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                    {p.quantity}
                  </span>
                </td>
                <td style={{ ...styles.td, borderRight: '1px solid #f1f5f9', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                  <button onClick={() => handleOpenModal(p)} style={{ border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => { if(window.confirm('Delete this item?')) dispatch(deleteProduct(p._id)) }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0 }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSave} style={styles.inputGroup}>
              <input style={styles.input} placeholder="Product Name" value={form.brand} onChange={e => setForm({...form, name: e.target.value})} required />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input style={{ ...styles.input, flex: 1 }} type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                <input style={{ ...styles.input, flex: 1 }} type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={handleCloseModal} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ ...styles.addBtn, flex: 1 }}>{editId ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;