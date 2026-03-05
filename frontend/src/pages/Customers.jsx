import { useEffect, useState } from "react";
import { addCustomer, getCustomers, searchCustomers, getStores, getCustomer, getCustomerRentals, updateCustomer, deleteCustomer, returnRental,} from "../api";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [customerId, setCustomerId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");

  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStoreId, setNewStoreId] = useState("1");
  const [stores, setStores] = useState([]);

  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selected, setSelected] = useState(null);

  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStoreId, setEditStoreId] = useState("1");
  const [editActive, setEditActive] = useState(1);

  const [rentals, setRentals] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const usingSearch = customerId || firstName || lastName;

  async function load(p = page) {
    setError("");
    try {
      let data;
      if (usingSearch) {
        data = await searchCustomers({
          customer_id: customerId,
          first_name: firstName,
          last_name: lastName,
          page: p,
          pageSize,
        });
      } else {
        data = await getCustomers(p, pageSize);
      }
      setRows(data.customers || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch (e) {
      setError("Could not load customers. Check backend is running.");
    }
  }

  useEffect(() => {
    load(1);

    getStores()
        .then((data) => {
        setStores(data || []);
        if ((data || []).length > 0) {
            setNewStoreId(String(data[0].store_id));
        }
        })
        .catch(() => {
        setStores([{ store_id: 1 }]);
        setNewStoreId("1");
        });

    }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function onSearch() {
    setPage(1);
    load(1);
  }

  function clearSearch() {
    setCustomerId("");
    setFirstName("");
    setLastName("");
    setPage(1);
    setTimeout(() => load(1), 0);
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    return re.test(email);
  }
  
  async function onAddCustomer(e) {
    e.preventDefault();
    setError("");

    const payload = {
      first_name: newFirst.trim(),
      last_name: newLast.trim(),
      email: newEmail.trim(),
      store_id: Number(newStoreId || 1),
      active: 1,
    };

    if (!payload.first_name || !payload.last_name || !payload.email) {
      setError("First name, last name, and email are required.");
      return;
    }

    if (!isValidEmail(payload.email)) {
      setError("Invalid email. Must look like name@domain.com (TLD 2+ letters).");
      return;
    }

    try {
      await addCustomer(payload);
      setNewFirst("");
      setNewLast("");
      setNewEmail("");
      load(1);
    } catch (err) {
      setError(err.message || "Could not add customer.");
    }
  }

  function openEdit(c) {
    setSelected(c);
    setEditFirst(c.first_name || "");
    setEditLast(c.last_name || "");
    setEditEmail(c.email || "");
    setEditStoreId(String(c.store_id || 1));
    setEditActive(c.active ? 1 : 0);
    setShowEdit(true);
  }

  async function openDetails(c) {
    setError("");
    setSelected(c);
    setShowDetails(true);
    setDetailsLoading(true);
    setRentals([]);

    try {
      await getCustomer(c.customer_id);
      const data = await getCustomerRentals(c.customer_id);
      setRentals(data.rentals || []);
    } catch (e) {
      setError(e.message || "Could not load customer details.");
    } finally {
      setDetailsLoading(false);
    }
  }

    async function onSaveEdit() {
      if (!selected) return;
      setError("");

      const payload = {
        first_name: editFirst.trim(),
        last_name: editLast.trim(),
        email: editEmail.trim(),
        store_id: Number(editStoreId || 1),
        active: Number(editActive),
      };

      if (!payload.first_name || !payload.last_name || !payload.email) {
        setError("First name, last name, and email are required.");
        return;
      }
      if (!isValidEmail(payload.email)) {
        setError("Invalid email. Must look like name@domain.com (TLD 2+ letters).");
        return;
      }

      try {
        await updateCustomer(selected.customer_id, payload);
        setShowEdit(false);
        await load(page);
      } catch (e) {
        setError(e.message || "Could not update customer.");
      }
    }

    async function onDelete(c) {
      const ok = window.confirm(
        `Delete customer ${c.customer_id} (${c.first_name} ${c.last_name})?`
      );
      if (!ok) return;

      setError("");
      try {
        await deleteCustomer(c.customer_id);
        await load(page);
      } catch (e) {
        setError(e.message || "Could not delete customer.");
      }
    }

    async function onReturnRental(rentalId) {
      setError("");
      try {
        await returnRental(rentalId);
        if (selected) {
          const data = await getCustomerRentals(selected.customer_id);
          setRentals(data.rentals || []);
        }
      } catch (e) {
        setError(e.message || "Could not return rental.");
      }
    }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Customers</h2>
        </div>
        <span className="badge bg-dark rounded-pill">Total: {total}</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search/Filter */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-primary text-white">Search / Filter</div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <label className="form-label">Customer ID</label>
              <input
                className="form-control"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">First Name</label>
              <input
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. MARY"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Last Name</label>
              <input
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. SMITH"
              />
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button className="btn btn-primary w-100" onClick={onSearch}>
                Search
              </button>
              <button className="btn btn-outline-secondary w-100" onClick={clearSearch}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add customer */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-success text-white">Add New Customer</div>
        <div className="card-body">
          <form onSubmit={onAddCustomer}>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={newFirst} onChange={(e) => setNewFirst(e.target.value)} placeholder="e.g. MARY"/>
              </div>
              <div className="col-md-3">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={newLast} onChange={(e) => setNewLast(e.target.value)} placeholder="e.g. SMITH"/>
              </div>
              <div className="col-md-3">
                <label className="form-label">Email *</label>
                <input className="form-control" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@domain.com"/>
              </div>
              <div className="col-md-1">
                <label className="form-label">Store *</label>
                <select
                className="form-select"
                value={newStoreId}
                onChange={(e) => setNewStoreId(e.target.value)}
                >
                {stores.map((s) => (
                    <option key={s.store_id} value={String(s.store_id)}>
                    Store {s.store_id}
                    </option>
                ))}
                </select>
              </div>
              <div className="col-md-12 mt-2">
                <button
                    type="submit"
                    className="btn btn-success"
                    disabled={
                        !newFirst.trim() ||
                        !newLast.trim() ||
                        !newEmail.trim() ||
                        !isValidEmail(newEmail.trim())
                    }
                    >
                    Add Customer
                    </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <div>Customers</div>
          <div className="small opacity-75">
            Page {page} / {totalPages}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Store</th>
                <th>Active</th>
                <th>Create Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.customer_id}>
                  <td>{c.customer_id}</td>
                  <td>{c.first_name} {c.last_name}</td>
                  <td>{c.email || "-"}</td>
                  <td>{c.store_id}</td>
                  <td>
                    <span className={`badge ${c.active ? "bg-success" : "bg-secondary"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{String(c.create_date).slice(0, 10)}</td>

                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openDetails(c)}
                    >
                      Details
                    </button>

                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEdit(c)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(c)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-body d-flex justify-content-between align-items-center">
          <button
            className="btn btn-outline-primary"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            ← Prev
          </button>

          <div className="text-muted small">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </div>

          <button
            className="btn btn-outline-primary"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      {showEdit && ( <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Customer</h5>
              <button className="btn-close" onClick={() => setShowEdit(false)} />
            </div>

            <div className="modal-body">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input className="form-control" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input className="form-control" value={editLast} onChange={(e) => setEditLast(e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Store</label>
                  <select className="form-select" value={editStoreId} onChange={(e) => setEditStoreId(e.target.value)}>
                    {stores.map((s) => (
                      <option key={s.store_id} value={String(s.store_id)}>
                        Store {s.store_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Active</label>
                  <select
                    className="form-select"
                    value={String(editActive)}
                    onChange={(e) => setEditActive(Number(e.target.value))}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={onSaveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div> 
      )}

      {showDetails && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Customer Details {selected ? `(#${selected.customer_id})` : ""}
                </h5>
                <button className="btn-close" onClick={() => setShowDetails(false)} />
              </div>

              <div className="modal-body">
                {detailsLoading ? (
                  <div className="text-muted">Loading...</div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div>
                        <strong>Name:</strong> {selected?.first_name} {selected?.last_name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selected?.email || "-"}
                      </div>
                      <div>
                        <strong>Store:</strong> {selected?.store_id}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        {selected?.active ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <h6 className="mb-2">Rental History</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Rental ID</th>
                            <th>Film</th>
                            <th>Rental Date</th>
                            <th>Return Date</th>
                            <th>Store</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {rentals.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-muted">
                                No rentals found.
                              </td>
                            </tr>
                          ) : (
                            rentals.map((r) => (
                              <tr key={r.rental_id}>
                                <td>{r.rental_id}</td>
                                <td>{r.film_title}</td>
                                <td>{String(r.rental_date).slice(0, 19)}</td>
                                <td>
                                  {r.return_date ? (
                                    String(r.return_date).slice(0, 19)
                                  ) : (
                                    <span className="badge bg-warning text-dark">
                                      Out
                                    </span>
                                  )}
                                </td>
                                <td>{r.store_id}</td>
                                <td>
                                  {!r.return_date && (
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => onReturnRental(r.rental_id)}
                                    >
                                      Mark Returned
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}