import React, { useEffect, useState } from "react";
import axios from "axios";
import { InvestorLayout } from "./InvestorLayout";

interface UPIMethod {
  _id: string;
  name: string;
  upiId: string;
  isDefault: boolean;
}

export default function ManageUPI() {
  const [methods, setMethods] = useState<UPIMethod[]>([]);
  const [form, setForm] = useState({ name: "", upiId: "", isDefault: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchMethods = async () => {
    const res = await axios.get("http://localhost:5000/api/payouts/", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    setMethods(res.data.filter((m: any) => m.type === "upi"));
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/payouts/${editingId}`, form, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      } else {
        await axios.post("http://localhost:5000/api/payouts/add-upi", form, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      }
      setForm({ name: "", upiId: "", isDefault: false });
      setEditingId(null);
      fetchMethods();
    } catch (err: any) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleEdit = (method: UPIMethod) => {
    setForm({ name: method.name, upiId: method.upiId, isDefault: method.isDefault });
    setEditingId(method._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this UPI method?")) return;
    await axios.delete(`http://localhost:5000/api/payouts/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    fetchMethods();
  };

  return (
    <InvestorLayout>
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage UPI Methods</h2>
      
      <div className="mb-4">
        <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 mr-2"/>
        <input type="text" placeholder="UPI ID" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })} className="border p-2 mr-2"/>
        <label className="mr-2">
          <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })}/> Default
        </label>
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2">{editingId ? "Update" : "Add"}</button>
      </div>

      <table className="border w-full">
        <thead>
          <tr>
            <th className="border px-2">Name</th>
            <th className="border px-2">UPI ID</th>
            <th className="border px-2">Default</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {methods.map(m => (
            <tr key={m._id}>
              <td className="border px-2">{m.name}</td>
              <td className="border px-2">{m.upiId}</td>
              <td className="border px-2">{m.isDefault ? "Yes" : "No"}</td>
              <td className="border px-2">
                <button onClick={() => handleEdit(m)} className="text-green-500 mr-2">Edit</button>
                <button onClick={() => handleDelete(m._id)} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </InvestorLayout>
  );
}
