import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
// Assuming 'Layout' is a simple wrapper component that handles overall page structure
import { Layout } from "./Layout";

// Interface for backend populated data
interface Investment {
  _id: string;
  amount: number;
  investorId: { name: string; email: string };
  projectId: { title: string; fundingGoal?: number; currentFunding?: number; status?: string };
  paymentId?: string;
}

// Interface for the new Stats endpoint
interface InvestmentStats {
    totals: {
        totalAmount: number;
        totalCount: number;
    };
    topProjects: {
        projectId: string;
        title: string;
        totalAmount: number;
        count: number;
    }[];
}

// Modern styling variables
const styles = {
  pageBackground: {
    background: "linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d1a88 100%)",
    minHeight: "100vh",
    color: "#ffffff",
    fontFamily: "'Inter', 'Poppins', sans-serif"
  },
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  header: {
    color: "#ffffff",
    fontSize: "2.5rem",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "2px",
    marginBottom: "30px",
    textAlign: "center" as const,
    background: "linear-gradient(90deg, #ff3b3b, #ff6b6b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(255, 59, 59, 0.3)"
  },
  card: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease-in-out"
  },
  button: {
    primary: {
      background: "#ff3b3b",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "25px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.3s ease-in-out",
      textTransform: "uppercase" as const,
      letterSpacing: "1px"
    },
    secondary: {
      background: "rgba(255,255,255,0.1)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)",
      padding: "8px 16px",
      borderRadius: "20px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.3s ease-in-out"
    }
  },
  table: {
    container: {
      width: "100%",
      borderCollapse: "collapse" as const,
      marginTop: "20px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "15px",
      overflow: "hidden",
      backdropFilter: "blur(10px)"
    },
    header: {
      background: "linear-gradient(135deg, rgba(255,59,59,0.2) 0%, rgba(255,107,107,0.1) 100%)",
      borderBottom: "2px solid rgba(255,255,255,0.1)"
    },
    cell: {
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "15px",
      textAlign: "left" as const
    }
  },
  statCard: {
    background: "linear-gradient(135deg, rgba(86, 98, 246, 0.2) 0%, rgba(128, 90, 213, 0.2) 100%)",
    padding: "25px",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    flex: 1,
    minWidth: "250px",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease-in-out"
  },
  errorAlert: {
    background: "linear-gradient(135deg, rgba(255,59,59,0.2) 0%, rgba(255,107,107,0.1) 100%)",
    border: "1px solid rgba(255,59,59,0.3)",
    padding: "15px",
    borderRadius: "10px",
    color: "#ff6b6b",
    marginBottom: "20px",
    backdropFilter: "blur(10px)"
  },
  loadingText: {
    padding: "40px",
    textAlign: "center" as const,
    fontSize: "18px",
    color: "#ffffff"
  }
};

// Common cell style
const cellStyle: React.CSSProperties = { 
  ...styles.table.cell,
  color: "#ffffff"
};

const ManageInvestments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://localhost:5000/api/admin/investments";

  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch investments and stats
  const fetchAdminData = useCallback(async () => {
    setError(null);
    const token = getToken();
    if (!token) {
      setLoading(false);
      return setError("No token found. Please login as admin.");
    }

    try {
      setLoading(true);
      // Fetch list of investments
      const investmentsPromise = axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Fetch summary statistics
      const statsPromise = axios.get(`${API_BASE}/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const [investmentsRes, statsRes] = await Promise.all([investmentsPromise, statsPromise]);

      setInvestments(investmentsRes.data.investments || []);
      setStats(statsRes.data);

    } catch (err: any) {
      console.error("Error fetching admin data:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  // Delete investment
  const handleDelete = async (id: string) => {
    setError(null);
    if (!window.confirm("CONFIRM: Are you sure you want to permanently delete this investment record? This action cannot be undone.")) return;

    const token = getToken();
    if (!token) return setError("No token found. Please login as admin.");

    try {
      await axios.delete(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setInvestments((prev) => prev.filter((inv) => inv._id !== id)); // Optimistic update
      fetchAdminData(); // Refresh stats after deletion
      alert("Investment deleted successfully.");
    } catch (err: any) {
      console.error("Error deleting investment:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Failed to delete investment.");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]); // Dependency array includes the stable fetch function

  // Currency Formatter
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  if (loading) return <p style={styles.loadingText}>Loading admin data...</p>;

  return (
    <Layout>
      <div style={styles.pageBackground}>
        <div style={styles.container}>
          <h1 style={styles.header}>Admin: Investment Dashboard 📈</h1>
          {error && <div style={styles.errorAlert}>{error}</div>}

          {/* Investment Summary Stats */}
          {stats && (
            <InvestmentStatsDisplay stats={stats} formatCurrency={formatCurrency} />
          )}

          {/* Investment List */}
          <div style={{...styles.card, marginTop: "30px"}}>
            <h2 style={{color: "#ffffff", marginBottom: "20px", fontSize: "1.5rem", fontWeight: "600"}}>
              Recent Investments ({investments.length})
            </h2>
            {investments.length === 0 ? (
              <p style={{color: "rgba(255,255,255,0.7)"}}>No investments found.</p>
            ) : (
              <div style={{overflowX: "auto"}}>
                <table style={styles.table.container}>
                  <thead>
                    <tr style={styles.table.header}>
                      <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Investor</th>
                      <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Project</th>
                      <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Amount (INR)</th>
                      <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Payment ID</th>
                      <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => (
                      <tr 
                        key={inv._id}
                        style={{
                          transition: "all 0.3s ease-in-out",
                          borderBottom: "1px solid rgba(255,255,255,0.05)"
                        }}
                      >
                        <td style={cellStyle}>
                          <div style={{fontWeight: "500"}}>{inv.investorId.name}</div>
                          <div style={{fontSize: "12px", color: "rgba(255,255,255,0.6)"}}>{inv.investorId.email}</div>
                        </td>
                        <td style={cellStyle}>
                          <strong style={{color: "#ffffff"}}>{inv.projectId.title}</strong>
                        </td>
                        <td style={{...cellStyle, color: "#4cd964", fontWeight: "600"}}>
                          {formatCurrency(inv.amount)}
                        </td>
                        <td style={{...cellStyle, fontSize: "10px", color: "rgba(255,255,255,0.7)"}}>
                          {inv.paymentId || "N/A"}
                        </td>
                        <td style={{...cellStyle, textAlign: "center"}}>
                          <button 
                            onClick={() => handleDelete(inv._id)} 
                            style={styles.button.primary}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#ff5252";
                              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(255, 82, 82, 0.5)";
                              (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#ff3b3b";
                              (e.currentTarget as HTMLElement).style.boxShadow = "none";
                              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ---------------------------------------------------------------------------
// 🌟 Component to display investment statistics
// ---------------------------------------------------------------------------
const InvestmentStatsDisplay: React.FC<{ stats: InvestmentStats, formatCurrency: (amount: number) => string }> = ({ stats, formatCurrency }) => {
    
    // Enhanced stat box style
    const statBoxStyle: React.CSSProperties = {
        ...styles.statCard,
        cursor: "pointer",
        position: "relative" as const,
        overflow: "hidden"
    };

    const statBoxHoverEffect = {
        transform: "scale(1.03)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)"
    };
    
    return (
        <div style={{ marginBottom: '30px' }}>
            <h2 style={{color: "#ffffff", marginBottom: "25px", fontSize: "1.8rem", fontWeight: "600"}}>
                Investment Summary 📊
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                {/* Total Stats Box */}
                <div 
                    style={{ 
                        ...statBoxStyle, 
                        background: "linear-gradient(135deg, rgba(86, 98, 246, 0.3) 0%, rgba(128, 90, 213, 0.3) 100%)"
                    }}
                    onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = statBoxHoverEffect.transform;
                        // FIX: Explicitly cast target to HTMLElement
                        target.style.boxShadow = statBoxHoverEffect.boxShadow; 
                    }}
                    onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = "scale(1)";
                        // FIX: Explicitly cast target to HTMLElement
                        target.style.boxShadow = styles.statCard.boxShadow;
                    }}
                >
                    <p style={{ margin: '0', fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                        Total Investments Count
                    </p>
                    <p style={{ 
                        margin: '10px 0 0 0', 
                        fontSize: '2.5rem', 
                        fontWeight: 'bold',
                        background: "linear-gradient(90deg, #4cd964, #5ac8fa)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        {stats.totals.totalCount.toLocaleString()}
                    </p>
                    <div style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        width: "60px",
                        height: "60px",
                        background: "rgba(76, 217, 100, 0.1)",
                        borderRadius: "50%"
                    }}></div>
                </div>
                
                <div 
                    style={{ 
                        ...statBoxStyle, 
                        background: "linear-gradient(135deg, rgba(255, 149, 0, 0.3) 0%, rgba(255, 45, 85, 0.3) 100%)"
                    }}
                    onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = statBoxHoverEffect.transform;
                        target.style.boxShadow = statBoxHoverEffect.boxShadow;
                    }}
                    onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.transform = "scale(1)";
                        target.style.boxShadow = styles.statCard.boxShadow;
                    }}
                >
                    <p style={{ margin: '0', fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                        Total Funds Raised
                    </p>
                    <p style={{ 
                        margin: '10px 0 0 0', 
                        fontSize: '2.5rem', 
                        fontWeight: 'bold',
                        background: "linear-gradient(90deg, #ff9d00, #ff2d55)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        {formatCurrency(stats.totals.totalAmount)}
                    </p>
                    <div style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        width: "60px",
                        height: "60px",
                        background: "rgba(255, 149, 0, 0.1)",
                        borderRadius: "50%"
                    }}></div>
                </div>
            </div>

            {/* Top Projects List */}
            <div style={styles.card}>
                <h3 style={{ 
                    marginTop: '0', 
                    marginBottom: '20px', 
                    color: "#ffffff", 
                    fontSize: "1.3rem",
                    fontWeight: "600"
                }}>
                    🏆 Top 10 Projects by Funding
                </h3>
                {stats.topProjects.length > 0 ? (
                    <div style={{overflowX: "auto"}}>
                        <table style={styles.table.container}>
                            <thead>
                                <tr style={styles.table.header}>
                                    <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Project Title</th>
                                    <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Total Invested Amount</th>
                                    <th style={{...cellStyle, color: "#ffffff", fontWeight: "600"}}>Investments Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topProjects.map((p, index) => (
                                    <tr 
                                        key={p.projectId}
                                        style={{
                                            transition: "all 0.3s ease-in-out",
                                            borderBottom: "1px solid rgba(255,255,255,0.05)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        <td style={cellStyle}>
                                            <span style={{
                                                display: "inline-block",
                                                width: "24px",
                                                height: "24px",
                                                background: index < 3 ? 
                                                    ["#ffd700", "#c0c0c0", "#cd7f32"][index] : 
                                                    "rgba(255,255,255,0.1)",
                                                borderRadius: "50%",
                                                textAlign: "center",
                                                lineHeight: "24px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                marginRight: "10px",
                                                color: index < 3 ? "#000000" : "#ffffff"
                                            }}>
                                                {index + 1}
                                            </span>
                                            {p.title}
                                        </td>
                                        <td style={{...cellStyle, color: "#4cd964", fontWeight: "600"}}>
                                            {formatCurrency(p.totalAmount)}
                                        </td>
                                        <td style={cellStyle}>{p.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{color: "rgba(255,255,255,0.7)"}}>No project data available.</p>
                )}
            </div>
        </div>
    );
};

export default ManageInvestments;