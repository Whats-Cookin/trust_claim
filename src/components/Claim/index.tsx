import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function Claim(claim: { [key: string]: string | number }) {
  const fieldArr = Object.keys(claim);

  return (
    <TableContainer component={Paper} sx={{ marginTop: "20px" }}>
      <Table sx={{ minWidth: 500 }} aria-label="simple table">
        <TableBody>
          {fieldArr.map((fieldName) => {
            if (claim[fieldName]) {
              return (
                <TableRow
                  key={fieldName}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {fieldName}
                  </TableCell>
                  <TableCell align="left">{claim[fieldName]}</TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
