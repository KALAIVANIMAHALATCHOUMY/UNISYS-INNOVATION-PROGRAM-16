import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useSelector } from 'react-redux';

export default function BasicTable({ agentName }) {
  const fileMap = useSelector((state) => state.fileNames);
  const pdfAgents = fileMap[agentName] || [];

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="file table">
        <TableHead>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell align="right">Extension</TableCell>
            <TableCell align="right">Size</TableCell>
            <TableCell align="right">Uploaded</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pdfAgents.map((fileName, index) => {
            const extension = fileName.split('.').pop();
            return (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {fileName}
                </TableCell>
                <TableCell align="right">{extension}</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell align="right">—</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
