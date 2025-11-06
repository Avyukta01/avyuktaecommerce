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
    admins: number; 
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
          {/* Total Admins Card */}
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
                    Total Admins
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={80} height={40} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {stats?.admins?.toLocaleString() ?? "-"}
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
                  <span>Active Admins</span>
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

        {/* Remaining charts, transactions, statistics sections remain unchanged */}
        {/* Only customer references in statistics replaced with admins */}
        {/* Statistics Section */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          bgcolor: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
            All Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { name: "Orders", amount: `₹${stats?.orders || 0}`, color: "#3b82f6" },
              { name: "Revenue", amount: `₹${stats?.revenue || 0}`, color: "#10b981" },
              { name: "Admins", amount: `${stats?.admins || 0}`, color: "#8b5cf6" },
              { name: "Wallets", amount: `${stats?.activeWallets || 0}`, color: "#06b6d4" }
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
        </Paper>
  </div>
);

};

export default AdminDashboardPage;
