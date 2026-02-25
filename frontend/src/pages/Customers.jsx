import { useEffect, useState } from "react";
import { addCustomer, getCustomers, searchCustomers, getStores } from "../api";

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
        const res = await addCustomer(payload);
        setNewFirst("");
        setNewLast("");
        setNewEmail("");
        load(1);
    } catch (err) {
        setError(err.message || "Could not add customer.");
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
    </div>
  );
}