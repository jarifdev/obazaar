"use client";

import React, { useState, useEffect } from "react";

interface WalletInfo {
  id: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    paymentInfo?: {
      paypalEmail?: string;
      preferredPayoutMethod?: string;
    };
  };
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
}

interface PendingPayout {
  id: string;
  amount: number;
  method: string;
  status: string;
  recipientEmail?: string;
  requestedAt: string;
  wallet: {
    tenant: {
      name: string;
      slug: string;
    };
  };
}

export default function PayoutManager() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch wallets with balances
      const walletsResponse = await fetch("/api/admin/wallets-summary");
      const walletsData = await walletsResponse.json();

      // Fetch pending payouts
      const payoutsResponse = await fetch("/api/wallet/process-payouts");
      const payoutsData = await payoutsResponse.json();

      setWallets(walletsData.wallets || []);
      setPendingPayouts(payoutsData.pending || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processPayouts = async () => {
    try {
      setProcessing(true);
      const response = await fetch("/api/wallet/process-payouts", {
        method: "POST",
      });

      if (response.ok) {
        alert("Payouts processed successfully!");
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error processing payouts:", error);
      alert("Failed to process payouts");
    } finally {
      setProcessing(false);
    }
  };

  const createPayout = async (walletId: string, amount: number) => {
    try {
      const response = await fetch("/api/admin/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, amount }),
      });

      if (response.ok) {
        alert("Payout created successfully!");
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating payout:", error);
      alert("Failed to create payout");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-block",
              width: "32px",
              height: "32px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
        <p style={{ color: "#6b7280" }}>Loading payout data...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "24px" }}>
        {/* Process Payouts Button */}
        <div style={{ marginBottom: "32px" }}>
          <button
            onClick={processPayouts}
            disabled={processing || pendingPayouts.length === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 24px",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "6px",
              cursor:
                processing || pendingPayouts.length === 0
                  ? "not-allowed"
                  : "pointer",
              backgroundColor:
                processing || pendingPayouts.length === 0
                  ? "#9ca3af"
                  : "#3b82f6",
              color: "white",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!processing && pendingPayouts.length > 0) {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              if (!processing && pendingPayouts.length > 0) {
                e.currentTarget.style.backgroundColor = "#3b82f6";
              }
            }}
          >
            {processing ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #ffffff",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: "8px",
                  }}
                ></div>
                Processing...
              </>
            ) : (
              <>
                Process {pendingPayouts.length} Pending Payout
                {pendingPayouts.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>

        {/* Pending Payouts Section */}
        {pendingPayouts.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f59e0b",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#ffffff",
                  }}
                >
                  <svg
                    style={{ width: "20px", height: "20px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Pending Payouts
                </h2>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Vendor
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Method
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        Date Requested
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayouts.map((payout, index) => (
                      <tr
                        key={payout.id}
                        style={{
                          borderBottom:
                            index < pendingPayouts.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                marginBottom: "4px",
                                color: "#111827",
                              }}
                            >
                              {payout.wallet.tenant.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                              @{payout.wallet.tenant.slug}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#f59e0b",
                            }}
                          >
                            ${payout.amount.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                              border: "1px solid #bfdbfe",
                            }}
                          >
                            {payout.method}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            whiteSpace: "nowrap",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          {payout.recipientEmail || "-"}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            whiteSpace: "nowrap",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          {new Date(payout.requestedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Wallets Section */}
        <div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}
          >
            <div
              style={{
                backgroundColor: "#8b5cf6",
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#ffffff",
                }}
              >
                <svg
                  style={{ width: "20px", height: "20px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Vendor Wallets
              </h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Vendor
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Available
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Pending
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Total Earned
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      PayPal Email
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet, index) => (
                    <tr
                      key={wallet.id}
                      style={{
                        borderBottom:
                          index < wallets.length - 1
                            ? "1px solid #f3f4f6"
                            : "none",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              marginBottom: "4px",
                              color: "#111827",
                            }}
                          >
                            {wallet.tenant.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            @{wallet.tenant.slug}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#10b981",
                          }}
                        >
                          ${wallet.availableBalance.toFixed(2)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#f59e0b",
                          }}
                        >
                          ${wallet.pendingBalance.toFixed(2)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#6b7280",
                          }}
                        >
                          ${wallet.totalEarnings.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                        {wallet.tenant.paymentInfo?.paypalEmail ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <svg
                              style={{
                                width: "16px",
                                height: "16px",
                                color: "#10b981",
                              }}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span
                              style={{ fontSize: "12px", color: "#6b7280" }}
                            >
                              {wallet.tenant.paymentInfo.paypalEmail}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                            }}
                          >
                            Not configured
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        {wallet.availableBalance > 0 &&
                        wallet.tenant.paymentInfo?.paypalEmail ? (
                          <button
                            onClick={() => {
                              const amount = prompt(
                                `Create payout for ${wallet.tenant.name}.\nAvailable: $${wallet.availableBalance.toFixed(2)}\nEnter amount:`
                              );
                              if (amount && parseFloat(amount) > 0) {
                                createPayout(wallet.id, parseFloat(amount));
                              }
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "8px 16px",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "500",
                              borderRadius: "4px",
                              cursor: "pointer",
                              backgroundColor: "#3b82f6",
                              color: "white",
                              transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#2563eb";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#3b82f6";
                            }}
                          >
                            Create Payout
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                            {!wallet.tenant.paymentInfo?.paypalEmail
                              ? "Email required"
                              : "No balance"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
