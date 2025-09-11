import { Container } from "@mui/material";
import TransactionCard from "../components/TransactionCard";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import { useEffect, useState } from "react";
import type { Transaction } from "../types"

const BACKEND_URL = "http://localhost:3000";

async function getTransactions(): Promise<Transaction[]> {
  return fetch(`${BACKEND_URL}/get-transactions?user_id=1`).then((response) =>
    response.json()
  );
}

function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    getTransactions().then((json) => setTransactions(json.map((transaction => {
      // Modify API data before (eg. casting) saving it

      transaction.date = new Date(transaction.date);

      if (transaction.bookingDate) {
        transaction.bookingDate = new Date(transaction.bookingDate);
      }

      if (transaction.valueDate) {
        transaction.valueDate = new Date(transaction.valueDate);
      }

      return transaction;
      
    }))));
  }, []);

  return (
    <>
      <TopBar />
      <Container sx={{ mt: 2, mb: 10 }}>
        {transactions.map((transaction: Transaction) => {
          return (
            <TransactionCard transaction={transaction}/>
          );
        })}
      </Container>
      <BottomBar />
    </>
  );
}

export default Home;
