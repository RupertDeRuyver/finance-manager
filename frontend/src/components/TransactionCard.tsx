import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import type { Transaction } from "../types";

interface Props {
  transaction: Transaction;
}

function TransactionCard({ transaction }: Props) {
  return (
    <>
      <Accordion>
        <AccordionSummary>
          <Container>
            <Grid container spacing={2}>
              <Grid size={2}>
                <Typography align="center">{transaction.date.toLocaleDateString()}</Typography>
              </Grid>
              <Grid size={8}>
                <Typography align="center">{transaction.name}</Typography>
              </Grid>
              <Grid size={2}>
                {transaction.amount < 0 ? (
                  <Typography align="center" color="error">
                    -€{-transaction.amount}
                  </Typography>
                ) : (
                  <Typography align="center" color="success">
                    +€{transaction.amount}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Container>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{transaction.remittanceInformationUnstructured}</Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default TransactionCard;
