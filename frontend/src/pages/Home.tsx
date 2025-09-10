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
  category: string;
  subcategory: string;
  bic: string;
  comment: string;
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
      <Container sx={{ mt: 2, mb: 10 }}>
        {transactions.map((transaction: Transaction) => {
          return (
            <TransactionCard
              name={transaction.name}
              category={`${transaction.category} (${transaction.subcategory})`}
              amount={transaction.amount}
              description={`
                ID: ${transaction.transactionId}\n
                Date: ${transaction.date}\n
                Booking Date: ${transaction.bookingDate}\n
                Value Date: ${transaction.valueDate}\n
                Currency: ${transaction.currency}\n
                Creditor Name: ${transaction.creditorName}\n
                Creditor Account: ${transaction.creditorAccount}\n
                Debtor Name : ${transaction.debtorName}\n
                Debtor Account: ${transaction.debtorAccount}\n
                remittanceInformationUnstructured: ${transaction.remittanceInformationUnstructured}\n
                Manual: ${transaction.manual}\n
                Deleted: ${transaction.deleted}\n
                Description: ${transaction.description}\n
                Location: ${transaction.location}\n
                Postal Code: ${transaction.postal_code}\n
                Country: ${transaction.country}\n
                Payment Method: ${transaction.payment_method}\n
                BIC: ${transaction.bic}\n
                Comment: ${transaction.comment}\n
              `}
            />
          );
        })}
      </Container>
      <BottomBar />
    </>
  );
}

export default Home;
