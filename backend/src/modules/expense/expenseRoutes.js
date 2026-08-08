import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { addExpense, deleteExpense, getExpenses, getExpenseSummary, updateExpense } from "./expenseControllers.js";


const expenseRouter = express.Router();

expenseRouter.post("/", authMiddleware, addExpense);

expenseRouter.get("/", authMiddleware, getExpenses);

expenseRouter.get("/summary", authMiddleware, getExpenseSummary);

expenseRouter.patch("/:expenseId", authMiddleware, updateExpense);

expenseRouter.delete("/:expenseId", authMiddleware, deleteExpense);

export default expenseRouter;
