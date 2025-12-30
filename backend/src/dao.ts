import { Pool } from 'pg';
import { Category } from "./model/category";

export class DAO {

    private static pool: Pool;
    private static initialized = false;

    static async setup(): Promise<void> {

        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        try {
            await this.pool.query(`
                BEGIN;

                CREATE TABLE IF NOT EXISTS users
                (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL
                );

                CREATE TABLE IF NOT EXISTS categories
                (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,

                    parent_id UUID, 
                    CONSTRAINT fk_parent
                        FOREIGN KEY(parent_id) 
                        REFERENCES categories(id)
                        ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS locations
                (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    place VARCHAR(255) NOT NULL,
                    postal_code VARCHAR(255),
                    country_code VARCHAR(255) NOT NULL
                );

                CREATE TABLE IF NOT EXISTS accounts
                (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    account VARCHAR(255)
                );

                CREATE TABLE IF NOT EXISTS transactions
                (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    date TIMESTAMP NOT NULL,
                    description VARCHAR(255),

                    category_id UUID, 
                    CONSTRAINT fk_category
                        FOREIGN KEY(category_id) 
                        REFERENCES categories(id)
                        ON DELETE SET NULL,

                    user_id UUID NOT NULL, 
                    CONSTRAINT fk_user
                        FOREIGN KEY(user_id) 
                        REFERENCES users(id)
                        ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS gocardless_transactions
                (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    gocardless_transaction_id VARCHAR(255) NOT NULL,
                    booking_date TIMESTAMP NOT NULL,
                    value_date TIMESTAMP NOT NULL,
                    comment VARCHAR(255),
                    payment_method VARCHAR(255),
                    bic VARCHAR(255),
                    remittance_information_unstructured VARCHAR(255),
                    deleted BOOLEAN,

                    transaction_id UUID NOT NULL, 
                    CONSTRAINT fk_transaction
                        FOREIGN KEY(transaction_id) 
                        REFERENCES transactions(id)
                        ON DELETE CASCADE,

                    location_id UUID, 
                    CONSTRAINT fk_location
                        FOREIGN KEY(location_id) 
                        REFERENCES locations(id)
                        ON DELETE SET NULL,

                    creditor_id UUID, 
                    CONSTRAINT fk_creditor
                        FOREIGN KEY(creditor_id) 
                        REFERENCES accounts(id)
                        ON DELETE SET NULL,

                    debtor_id UUID, 
                    CONSTRAINT fk_debtor
                        FOREIGN KEY(debtor_id) 
                        REFERENCES accounts(id)
                        ON DELETE SET NULL
                );

                COMMIT;
            `)
            this.initialized = true;
        } catch (err: any) {
            throw new DaoInitializationError(err);
        }
    }

    static getSubcategories(category: Category): Category[] {
        if (!this.initialized) {throw new DaoNotInitializedError};
        return [];
    }

}

class DaoInitializationError extends Error {
    constructor(err: any) {
        super(err.message)
    }
}
class DaoNotInitializedError extends Error {}