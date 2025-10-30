
"use client";


import React, { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import MonthlySalesChart from "@/components/MonthlySalesChart";
import TargetGauge from "@/components/TargetGauge";
import { FaUserFriends } from "react-icons/fa";
import { FaBox } from "react-icons/fa6";
import { MdAttachMoney } from "react-icons/md";

import { FaWallet } from "react-icons/fa";
import apiClient from "@/lib/api";

// Material-UI imports
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Paper,
  Chip,
  LinearProgress
} from "@mui/material";

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ 
    customers: number; 
    orders: number; 
    revenue: number; 
    monthlySales: number[]; 
    targetPercent: number;
    walletBalance: number;
    activeWallets: number;
    recentTransactions: any[];
    transactionStats: any[];
  } | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('Month');


  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/admin/stats`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

return (
  <div className="space-y-6">

        {/* Modern Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          {/* Total Customers Card */}
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 1 }}>
                    Total Customers
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={40} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {stats?.customers?.toLocaleString() ?? "-"}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#f0f9ff', 
                  borderRadius: 2,
                  color: '#3b82f6'
                }}>
                  <FaUserFriends size={20} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                    <polyline points="17,6 23,6 23,12"></polyline>
                  </svg>
                  <span>Active Users</span>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Total Orders Card */}
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 1 }}>
                    Total Orders
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={40} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {stats?.orders?.toLocaleString() ?? "-"}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#fef3c7', 
                  borderRadius: 2,
                  color: '#f59e0b'
                }}>
                  <FaBox size={20} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#3b82f6',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="13" x2="15" y2="13"></line>
                    <line x1="9" y1="17" x2="15" y2="17"></line>
                  </svg>
                  <span>This Month</span>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 1 }}>
                    Total Revenue
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={120} height={40} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      ₹{(stats?.revenue ? (stats.revenue/100).toLocaleString() : "0")}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#ecfdf5', 
                  borderRadius: 2,
                  color: '#10b981'
                }}>
                  <MdAttachMoney size={20} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>INR Currency</span>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Wallet Balance Card */}
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 1 }}>
                    Wallet Balance
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={120} height={40} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      ₹{(stats?.walletBalance ? (stats.walletBalance/100).toLocaleString() : "0")}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#f0f9ff', 
                  borderRadius: 2,
                  color: '#3b82f6'
                }}>
                  <FaWallet size={20} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>{stats?.activeWallets || 0} Active Wallets</span>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Charts Section */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 4
        }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Monthly Sales Analytics
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['Year', 'Month', 'Day'].map((period) => (
                  <Box 
                    key={period}
                    onClick={() => setAnalyticsPeriod(period)}
                    sx={{ 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 2, 
                      bgcolor: analyticsPeriod === period ? '#3b82f6' : '#f1f5f9', 
                      color: analyticsPeriod === period ? 'white' : '#64748b',
                  fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': { 
                        bgcolor: analyticsPeriod === period ? '#2563eb' : '#e2e8f0' 
                      }
                    }}
                  >
                    {period}
                </Box>
                ))}
              </Box>
            </Box>
            {loading ? (
              <Box sx={{ height: 300 }}>
                <Skeleton variant="rectangular" width="100%" height="100%" />
              </Box>
            ) : (
              <MonthlySalesChart data={stats?.monthlySales} period={analyticsPeriod} />
            )}
          </Paper>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Wallet Card */}
            <Paper sx={{
              p: 0,
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
              overflow: 'hidden'
            }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                  Wallet Overview
                </Typography>
                {/* Card visual */}
                <Box sx={{
                  borderRadius: 3,
                  p: 2,
                  color: 'white',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #0ea5e9 100%)',
                  boxShadow: 'inset 0 0 40px rgba(255,255,255,0.12)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Admin</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Avyukta</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Admin Dashboard</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>Total Balance</Typography>
                  {loading ? (
                    <Skeleton variant="text" width={120} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ₹{(stats?.walletBalance ? (stats.walletBalance/100).toLocaleString() : "0")}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>INR</Typography>
                  </Box>
                </Box>
                {/* Active Wallets */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Active Wallets</Typography>
                  <Box sx={{ height: 8, bgcolor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', mt: 1 }}>
                    <Box sx={{ 
                      height: '100%', 
                      width: `${Math.min((stats?.activeWallets || 0) * 10, 100)}%`, 
                      bgcolor: '#3b82f6' 
                    }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {stats?.activeWallets || 0} active wallets
                  </Typography>
                </Box>
                {/* Quick Actions */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1.5, mt: 2 }}>
                  {[
                    { label: 'Send', bg: '#eef2ff', color: '#4338ca' },
                    { label: 'Receive', bg: '#ecfeff', color: '#0e7490' },
                    { label: 'Analytics', bg: '#ecfccb', color: '#4d7c0f' },
                    { label: 'More', bg: '#fee2e2', color: '#b91c1c' }
                  ].map((a, i) => (
                    <Box key={i} sx={{ 
                      textAlign: 'center', 
                      p: 1.25, 
                      bgcolor: a.bg, 
                      color: a.color, 
                      borderRadius: 2, 
                      fontSize: 12, 
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 }
                    }}>
                      {a.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Target Progress Card */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              bgcolor: 'white'
            }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
                Target Progress
              </Typography>
              {loading ? (
                <Box sx={{ height: 200 }}>
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                </Box>
              ) : (
                <TargetGauge percent={stats?.targetPercent} />
              )}
            </Paper>
          </Box>
        </Box>

        {/* Recent Transactions & Statistics */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3 
        }}>
          {/* Recent Transactions Table */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Recent Transactions
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 2,
                py: 1,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                cursor: 'pointer'
              }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Current Month
                </Typography>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </Box>
            </Box>
            
            {loading ? (
              <Box>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                    <Skeleton variant="text" width={80} height={20} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box>
                {/* Dynamic Transaction Data */}
                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 2, 
                      borderBottom: index < (stats.recentTransactions?.length || 0) - 1 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 2, 
                      bgcolor: '#f8fafc', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2,
                      fontSize: '18px'
                    }}>
                        {transaction.type === 'CREDIT' ? '💰' : transaction.type === 'DEBIT' ? '💸' : '🔄'}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {transaction.description || `${transaction.type} Transaction`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', mr: 2 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                          color: transaction.type === 'CREDIT' ? '#10b981' : '#ef4444'
                      }}>
                          {transaction.type === 'CREDIT' ? '+' : '-'}₹{(transaction.amount/100).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 2, 
                        bgcolor: transaction.status === 'COMPLETED' ? '#ecfdf5' : 
                                 transaction.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                        color: transaction.status === 'COMPLETED' ? '#10b981' : 
                               transaction.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {transaction.status}
                    </Box>
                    <Box sx={{ ml: 1, cursor: 'pointer', p: 0.5 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </Box>
                  </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      No recent transactions
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>

          {/* Statistics Card */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Statistics
              </Typography>
              <Box sx={{ cursor: 'pointer', p: 0.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </Box>
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
              Total ₹{(stats?.revenue ? (stats.revenue/100).toLocaleString() : "0")}
            </Typography>
            
            {loading ? (
              <Box>
                <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2 }} />
                <Box sx={{ mt: 2 }}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Skeleton variant="circular" width={12} height={12} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                {/* Progress Bar */}
                <Box sx={{ 
                  height: 8, 
                  bgcolor: '#f1f5f9', 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  mb: 3
                }}>
                  <Box sx={{ 
                    height: '100%', 
                    width: `${stats?.targetPercent || 0}%`, 
                    bgcolor: '#3b82f6',
                    borderRadius: 4
                  }} />
                </Box>
                
                {/* Dynamic Statistics */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { name: "Orders", amount: `₹${stats?.orders ? (stats.orders * 100).toLocaleString() : "0"}`, color: "#3b82f6", percentage: Math.min((stats?.orders || 0) / 100, 100) },
                    { name: "Revenue", amount: `₹${stats?.revenue ? (stats.revenue/100).toLocaleString() : "0"}`, color: "#10b981", percentage: Math.min((stats?.revenue || 0) / 100000, 100) },
                    { name: "Customers", amount: `${stats?.customers || 0}`, color: "#8b5cf6", percentage: Math.min((stats?.customers || 0) / 50, 100) },
                    { name: "Wallets", amount: `${stats?.activeWallets || 0}`, color: "#06b6d4", percentage: Math.min((stats?.activeWallets || 0) / 20, 100) }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: item.color 
                        }} />
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>
                        {item.amount}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
  </div>
);


};

export default AdminDashboardPage;
