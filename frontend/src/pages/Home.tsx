import { Container } from "@mui/material";
import TransactionCard from "../components/TransactionCard";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";


function Home() {
  return (
    <>
      <TopBar/>
      <Container sx={{ mt: 2 }}>
        <TransactionCard name="Colruyt" category="Winkel" amount={-50} />
        <TransactionCard name="Loon" category="Inkomsten" amount={104.8} />
      </Container>
      <BottomBar/>
    </>
  );
}

export default Home;
