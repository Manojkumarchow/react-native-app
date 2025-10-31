import React, { useState, useRef, useEffect } from 'react';

const STATUS_STEPS = ['Raised', 'Assigned', 'Completed', 'Closed'];
const BASE_URL = 'http://localhost:8080/whistleup/complaints';

export default function Issues() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    photo: null,
    photoName: '',
    status: 'Raised'
  });
  const fileInputRef = useRef();

  // Fetch all complaints from backend on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(BASE_URL, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      } else {
        setComplaints([]);
      }
    } catch (e) {
      alert("Could not fetch complaints: " + e);
      setComplaints([]);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        photo: URL.createObjectURL(file),
        photoName: file.name
      }));
    }
  };

  // Register a new complaint using backend endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();

    const complaintData = {
      type: form.type,
      title: form.title,
      description: form.description,
      status: 'Raised'
      // Extend with other fields as needed
    };

    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData)
      });

      if (response.status === 201 || response.status === 200) {
        alert("Complaint registered successfully!");
        setForm({
          type: '',
          title: '',
          description: '',
          photo: null,
          photoName: '',
          status: 'Raised'
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchComplaints();
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      alert("Server error: " + err);
    }
  };

  // Status local change, no backend support provided for this
  const nextStatus = idx =>
    setComplaints(prev =>
      prev.map((c, i) =>
        i === idx
          ? {
              ...c,
              status: STATUS_STEPS[
                Math.min(STATUS_STEPS.indexOf(c.status) + 1, STATUS_STEPS.length - 1)
              ]
            }
          : c
      )
    );

  // Render
  return (
    <div style={{ minHeight: '100vh', background: '#ecf1f8', padding: '30px 0' }}>
      <div className="center-card">
        <h2>Raise a Complaint</h2>
        <form style={{ width: '100%' }} onSubmit={handleSubmit}>
          <select
            name="type"
            value={form.type}
            required
            onChange={handleChange}
            style={{ marginBottom: 15 }}
          >
            <option value="">Select type...</option>
            <option value="Water">Water</option>
            <option value="Lift">Lift</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />
          <textarea
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            required
            style={{ resize: 'vertical' }}
          />
          <label
            htmlFor="photo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '2px dashed #5271ff',
              borderRadius: 12,
              padding: '8px 12px',
              cursor: 'pointer',
              color: '#5271ff',
              fontWeight: 'bold',
              fontSize: '1em',
              width: 'fit-content',
              userSelect: 'none',
              transition: 'background-color 0.2s',
              margin: '8px 0'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e6edff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="#5271ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="20"
              width="20"
              viewBox="0 0 24 24"
              style={{ marginRight: 8 }}
            >
              <path d="M21.44 11.05L12.12 20.37a4.5 4.5 0 0 1-6.36-6.36l9.32-9.32a3 3 0 0 1 4.24 4.24l-8.66 8.66a1.5 1.5 0 0 1-2.12-2.12l7.58-7.58" />
            </svg>
            Attach Photo
          </label>
          <input
            id="photo"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            style={{ display: 'none' }}
          />
          {form.photo && (
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <img src={form.photo} alt="attachment" style={{ width: 150, borderRadius: 10 }} />
              <div style={{ fontSize: 12, color: '#999' }}>{form.photoName}</div>
            </div>
          )}
          <button
            type="submit"
            style={{
              opacity: form.type && form.title && form.description ? 1 : 0.7
            }}
            disabled={!(form.type && form.title && form.description)}
          >
            Submit
          </button>
        </form>
      </div>
      <div className="list-container">
        <h2 style={{ textAlign: 'center', color: '#5271ff' }}>Complaints List</h2>
        {complaints.length === 0 && (
          <div style={{ color: '#8e99b4', textAlign: 'center', padding: 20 }}>
            No complaints yet.
          </div>
        )}
        {complaints.map((c, idx) => (
          <div
            key={c.complaintId || idx}
            style={{
              background: '#fafbff',
              borderRadius: 12,
              boxShadow: '0 1.5px 7px #e6eaf6',
              padding: '16px 15px',
              margin: '18px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ flex: 1, marginRight: 14 }}>
              <div>
                <strong>{c.title}</strong>
                <span style={{ color: '#5271ff', fontWeight: 700 }}> ({c.type})</span>
              </div>
              <div style={{ fontSize: 13, color: '#777', margin: '7px 0 3px 0' }}>
                {c.description}
              </div>
              <div style={{ fontSize: 14, color: '#5271ff' }}>Status: {c.status}</div>
              {c.photo && (
                <img src={c.photo} alt="attachment" style={{ width: 80, borderRadius: 7, marginTop: 7 }} />
              )}
            </div>
            {STATUS_STEPS.indexOf(c.status) < STATUS_STEPS.length - 1 && (
              <button
                style={{
                  marginLeft: 7,
                  background: '#eee',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 17px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Next Step"
                onClick={() => nextStatus(idx)}
              >
                →
              </button>
            )}
          </div>
        ))}
      </div>
      {/* --- STYLES --- */}
      <style>{`
        .center-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 6px 32px rgba(115,130,185,0.11), 0 1.5px 11px #c6dafa;
          width: 410px;
          max-width: 97vw;
          margin: 46px auto 12px auto;
          padding: 36px 36px 28px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .center-card h2 {
          font-weight: bold;
          margin-bottom: 18px;
          color: #5271ff;
          font-size: 1.35em;
        }
        .center-card select, .center-card input, .center-card textarea {
          width: 100%;
          font-size: 1.11em;
          padding: 13px 12px;
          border: 1px solid #d0daea;
          border-radius: 9px;
          margin-bottom: 15px;
          background: #f5f8fd;
          outline: none;
          box-sizing: border-box;
        }
        .center-card select:focus,
        .center-card input:focus,
        .center-card textarea:focus {
          border-color: #7ea8ed;
        }
        .center-card button[type="submit"] {
          width: 100%;
          background: #7d9bff;
          color: #fff;
          font-weight: 700;
          border: none;
          border-radius: 9px;
          padding: 14px;
          font-size: 1.11em;
          margin-top: 10px;
          box-shadow: 0 3px 8px #d0daea66;
          cursor: pointer;
        }
        .center-card button[type="submit"]:hover {
          background: #6490ff;
        }
        .list-container {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2.5px 14px #dcebfc, 0 1px 4px #c6daff75;
          width: 410px;
          max-width: 97vw;
          margin: 26px auto 0 auto;
          padding: 32px 30px 24px 30px;
          font-size: 1.07em;
        }
        @media (max-width:540px) {
          .center-card, .list-container {
            width: 98vw;
            padding: 9vw 3vw;
          }
          .center-card h2, .list-container h2 {
            font-size: 1.08em;
          }
        }
      `}</style>
    </div>
  );
}
