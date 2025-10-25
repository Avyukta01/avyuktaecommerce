"use client";
import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
  Typography,
  Button,
  Chip
} from "@mui/material";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onSort?: (columnId: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  };
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  loading = false,
  onSort,
  sortKey,
  sortOrder,
  emptyMessage = "No data found",
  pagination
}) => {
  const currentData = useMemo(() => {
    if (!pagination) return data;
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return data.slice(start, end);
  }, [data, pagination]);

  const handleSort = (columnId: string) => {
    if (onSort) {
      onSort(columnId);
    }
  };

  const renderCell = (column: Column, row: any) => {
    if (column.render) {
      return column.render(row[column.id], row);
    }
    return row[column.id];
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8fafc' }}>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ 
                  minWidth: column.minWidth,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}
                onClick={column.sortable ? () => handleSort(column.id) : undefined}
                sx={{
                  cursor: column.sortable ? 'pointer' : 'default',
                  '&:hover': column.sortable ? { bgcolor: '#f3f4f6' } : {}
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {column.label}
                  {column.sortable && sortKey === column.id && (
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Typography>
                  )}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            // Skeleton loading
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : currentData.length > 0 ? (
            currentData.map((row, index) => (
              <TableRow 
                key={row.id || index}
                sx={{ 
                  '&:hover': { bgcolor: '#f8fafc' },
                  '&:nth-of-type(even)': { bgcolor: '#fafafa' }
                }}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.id}
                    align={column.align}
                    sx={{ 
                      fontSize: '14px',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    {renderCell(column, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      {pagination && !loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2,
          borderTop: '1px solid #e5e7eb',
          bgcolor: '#f8fafc'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}–
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              sx={{ minWidth: 40 }}
            >
              Prev
            </Button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  size="small"
                  onClick={() => pagination.onPageChange(page)}
                  variant={pagination.currentPage === page ? 'contained' : 'outlined'}
                  sx={{ minWidth: 40 }}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              size="small"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              sx={{ minWidth: 40 }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </TableContainer>
  );
};

export default AdminTable;
