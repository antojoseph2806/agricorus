import React, { useEffect, useState } from "react";
import axios from "axios";
import { InvestorLayout } from "./InvestorLayout";

interface BankMethod {
  _id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  isDefault: boolean;
}

export default function ManageBank() {
  const [methods, setMethods] = useState<BankMethod[]>([]);
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    isDefault: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchMethods = async () => {
    const res = await axios.get("http://localhost:5000/api/payouts", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setMethods(res.data.filter((m: any) => m.type === "bank"));
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/payouts/${editingId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post("http://localhost:5000/api/payouts/add-bank", form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      setForm({
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        isDefault: false,
      });
      setEditingId(null);
      fetchMethods();
    } catch (err: any) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleEdit = (method: BankMethod) => {
    setForm({
      accountHolderName: method.accountHolderName,
      accountNumber: method.accountNumber,
      ifscCode: method.ifscCode,
      bankName: method.bankName,
      isDefault: method.isDefault,
    });
    setEditingId(method._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this bank method?")) return;
    await axios.delete(`http://localhost:5000/api/payouts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchMethods();
  };

  return (
    <InvestorLayout>
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Bank Methods</h2>

      <div className="mb-4 space-x-2">
        <input
          type="text"
          placeholder="Account Holder Name"
          value={form.accountHolderName}
          onChange={(e) =>
            setForm({ ...form, accountHolderName: e.target.value })
          }
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Account Number"
          value={form.accountNumber}
          onChange={(e) =>
            setForm({ ...form, accountNumber: e.target.value })
          }
          className="border p-2"
        />
        <input
          type="text"
          placeholder="IFSC Code"
          value={form.ifscCode}
          onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Bank Name"
          value={form.bankName}
          onChange={(e) => setForm({ ...form, bankName: e.target.value })}
          className="border p-2"
        />
        <label>
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) =>
              setForm({ ...form, isDefault: e.target.checked })
            }
          />{" "}
          Default
        </label>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <table className="border w-full">
        <thead>
          <tr>
            <th className="border px-2">Account Holder</th>
            <th className="border px-2">Account Number</th>
            <th className="border px-2">IFSC</th>
            <th className="border px-2">Bank</th>
            <th className="border px-2">Default</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {methods.map((m) => (
            <tr key={m._id}>
              <td className="border px-2">{m.accountHolderName}</td>
              <td className="border px-2">{m.accountNumber}</td>
              <td className="border px-2">{m.ifscCode}</td>
              <td className="border px-2">{m.bankName}</td>
              <td className="border px-2">{m.isDefault ? "Yes" : "No"}</td>
              <td className="border px-2">
                <button
                  onClick={() => handleEdit(m)}
                  className="text-green-500 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </InvestorLayout>
  );
}
