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
  description?: string;
}

function TransactionCard({ name, category, amount, description }: Props) {
  return (
    <>
      <Accordion>
        <AccordionSummary>
          <Container>
            <Grid container spacing={2}>
              <Grid size={2}>
                <Typography align="center">{category}</Typography>
              </Grid>
              <Grid size={8}>
                <Typography align="center">{name}</Typography>
              </Grid>
              <Grid size={2}>
                {amount < 0 ? (
                  <Typography align="center" color="error">
                    -€{-amount}
                  </Typography>
                ) : (
                  <Typography align="center" color="success">
                    +€{amount}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Container>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {description?.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default TransactionCard;
