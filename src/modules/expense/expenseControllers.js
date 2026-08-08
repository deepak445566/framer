import prisma from "../../config/prisma.js";

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    // Validate required fields
    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, and category are required",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        userId: req.user.id,
        title,
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
      }
    });

    return res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getExpenses = async (req, res) => {
  try {
    // FIXED: Changed variable name from 'express' to 'expenses'
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        date: "desc", // Better to order by date instead of createdAt
      }
    });

    return res.status(200).json({
      success: true,
      totalExpenses: expenses.length,
      expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    // Check if expense exists and belongs to user
    const expense = await prisma.expense.findFirst({
      where: {
        id: parseInt(expenseId),
        userId: req.user.id
      }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const { title, amount, category, description, date } = req.body;

    // Build update data with only provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (amount) updateData.amount = parseFloat(amount);
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);

    const updatedExpense = await prisma.expense.update({
      where: {
        id: expense.id
      },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await prisma.expense.findFirst({
      where: {
        id: parseInt(expenseId),
        userId: req.user.id,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await prisma.expense.delete({
      where: {
        id: expense.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id
      }
    });

    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalTransactions = expenses.length;

    // Calculate category-wise summary
    const categorySummary = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    // Get monthly summary
    const monthlySummary = expenses.reduce((acc, expense) => {
      const month = expense.date.toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += expense.amount;
      return acc;
    }, {});

    // Get recent expenses (last 5)
    const recentExpenses = expenses
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      summary: {
        totalExpense,
        totalTransactions,
        averageExpense: totalTransactions > 0 ? totalExpense / totalTransactions : 0,
        categorySummary,
        monthlySummary,
        recentExpenses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional utility function: Get expenses by category
export const getExpensesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        category: category,
      },
      orderBy: {
        date: "desc",
      },
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return res.status(200).json({
      success: true,
      category,
      totalExpenses: expenses.length,
      totalAmount,
      expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional utility function: Get expenses by date range
export const getExpensesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return res.status(200).json({
      success: true,
      startDate,
      endDate,
      totalExpenses: expenses.length,
      totalAmount,
      expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional utility function: Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
      },
    });

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No expenses found",
        stats: {
          total: 0,
          average: 0,
          max: 0,
          min: 0,
          categories: {},
        },
      });
    }

    const amounts = expenses.map(e => e.amount);
    const maxExpense = Math.max(...amounts);
    const minExpense = Math.min(...amounts);
    const totalExpense = amounts.reduce((sum, amt) => sum + amt, 0);
    const averageExpense = totalExpense / expenses.length;

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          count: 0,
          total: 0,
        };
      }
      acc[expense.category].count += 1;
      acc[expense.category].total += expense.amount;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      stats: {
        totalExpenses: expenses.length,
        totalAmount: totalExpense,
        averageExpense: averageExpense,
        maxExpense: maxExpense,
        minExpense: minExpense,
        categoryBreakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};