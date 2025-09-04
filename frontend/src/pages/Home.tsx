import { Container } from "@mui/material";
import TransactionCard from "../components/TransactionCard";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import { useEffect, useState } from "react";

interface Transaction {
  transactionId: string;
  userId: number;
  name: string;
  date: Date;
  bookingDate?: Date;
  valueDate?: Date;
  amount: number;
  currency: string;
  creditorName?: string;
  creditorAccount?: string;
  debtorName?: string;
  debtorAccount?: string;
  remittanceInformationUnstructured?: string;
  manual: boolean;
  deleted?: boolean;
  description?: string;
  location?: string;
  postal_code?: string;
  country?: string;
  payment_method?: string;
}

const BACKEND_URL = "http://localhost:3000";

async function getTransactions(): Promise<Transaction[]> {
  return fetch(`${BACKEND_URL}/get-transactions?user_id=1`).then((response) =>
    response.json()
  );
}

function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    getTransactions().then((json) => setTransactions(json));
  }, []);

  return (
    <>
      <TopBar />
      <Container sx={{ mt: 2 }}>
        {transactions.map((transaction: Transaction) => {
          return (
            <TransactionCard
              name={transaction.name}
              category="?"
              amount={transaction.amount}
            />
          );
        })}
      </Container>
      <BottomBar />
    </>
  );
}

export default Home;
