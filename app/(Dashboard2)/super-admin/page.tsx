"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { FaUserFriends, FaBox, FaStore } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Paper,
} from "@mui/material";

const SuperAdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ 
    customers: number; 
    orders: number; 
    revenue: number;
    admins: number;
    merchants: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch dashboard stats
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
      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        {/* Total Admins */}
        <Card sx={{ 
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
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
                    {stats?.admins?.toLocaleString() ?? "-"}
                  </Typography>
                )}
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#f3e8ff', borderRadius: 2, color: '#9333ea' }}>
                <FaUserFriends size={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card sx={{ 
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
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
              <Box sx={{ p: 1.5, bgcolor: '#fef3c7', borderRadius: 2, color: '#f59e0b' }}>
                <FaBox size={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        

        

        {/* Total Merchants */}
        <Card sx={{ 
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 1 }}>
                  Total Merchants
                </Typography>
                {loading ? (
                  <Skeleton variant="text" width={80} height={40} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {stats?.merchants?.toLocaleString() ?? "-"}
                  </Typography>
                )}
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#fef3c7', borderRadius: 2, color: '#f59e0b' }}>
                <FaStore size={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default SuperAdminDashboardPage;

