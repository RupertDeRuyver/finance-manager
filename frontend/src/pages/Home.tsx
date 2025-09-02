import { Container } from "@mui/material";
import TransactionCard from "../components/TransactionCard";
import NavBar from "../components/NavBar";

function Home() {
  return (
    <>
      <NavBar/>
      <Container sx={{mt: 2}}>
        <TransactionCard name="Colruyt" category="Winkel" amount={-50} />
        <TransactionCard name="Loon" category="Inkomsten" amount={104.80} />
      </Container>
    </>
  );
}

export default Home;
