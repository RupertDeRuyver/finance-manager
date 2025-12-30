import { DAO } from "../dao";

export class Category {
    private id: string;
    private parent: Category | undefined
    private name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    createSubcategory(id: string, name: string): Category {
        let sub = new Category(id, name);
        sub.parent = this;
        return sub;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getParent(): Category | undefined {
        return this.parent;
    }

    getSubcategories(): Category[] {
        return DAO.getSubcategories(this);
    }
}