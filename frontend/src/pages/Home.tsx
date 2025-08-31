import { Container } from "@mui/material";
import TransactionCard from "../components/TransactionCard";

function Home() {
  return (
    <>
      <Container>
        <TransactionCard name="Colruyt" category="Winkel" amount={-50} />
        <TransactionCard name="Loon" category="Inkomsten" amount={104.80} />
      </Container>
    </>
  );
}

export default Home;
