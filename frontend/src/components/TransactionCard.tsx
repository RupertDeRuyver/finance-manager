import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  Typography,
} from "@mui/material";

interface Props {
  name: string;
  category: string;
  amount: number;
}

function TransactionCard({ name, category, amount }: Props) {
  return (
    <>
      <Accordion>
        <AccordionSummary>
          <Container>
            <Grid container spacing={2}>
              <Grid size={2}>
                <Typography variant="h6" align="center">
                  {category}
                </Typography>
              </Grid>
              <Grid size={8}>
                <Typography variant="h6" align="center">
                  {name}
                </Typography>
              </Grid>
              <Grid size={2}>
                {amount < 0 ? (
                  <Typography variant="h6" align="center" color="error">
                    -€{-amount}
                  </Typography>
                ) : (
                  <Typography variant="h6" align="center" color="success">
                    +€{amount}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Container>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default TransactionCard;
