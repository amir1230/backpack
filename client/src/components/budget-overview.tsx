import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface BudgetOverviewProps {
  tripData: {
    id: number;
    title: string;
    budget?: string;
    startDate?: string;
    endDate?: string;
    destinations: any[];
  };
  expenses: Array<{
    id: number;
    amount: string;
    category: string;
    description: string;
    location?: string;
    createdAt: string;
  }>;
  categoryTotals: Array<{
    id: string;
    label: string;
    total: number;
    color: string;
  }>;
}

function BudgetOverview({ tripData, expenses, categoryTotals }: BudgetOverviewProps) {
  const budget = parseFloat(tripData.budget || "0");
  const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const remainingBudget = budget - totalSpent;
  const dailyBudget = budget > 0 && tripData.startDate && tripData.endDate 
    ? budget / Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getBudgetStatus = () => {
    if (budgetUsed <= 70) return { status: "good", color: "text-green-600", icon: CheckCircle };
    if (budgetUsed <= 90) return { status: "warning", color: "text-yellow-600", icon: AlertTriangle };
    return { status: "danger", color: "text-red-600", icon: AlertTriangle };
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon;

  return (
    <div className="space-y-6">
      {/* Budget Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Budget Overview
            </span>
            <Badge variant={budgetUsed <= 70 ? "default" : budgetUsed <= 90 ? "secondary" : "destructive"}>
              {budgetUsed.toFixed(1)}% Used
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trip Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{tripData.title}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {tripData.destinations?.length > 0 && (
                  <span>{tripData.destinations.length} destination{tripData.destinations.length > 1 ? 's' : ''}</span>
                )}
                {tripData.startDate && (
                  <>
                    <Calendar className="w-4 h-4 ml-3 mr-1" />
                    <span>{new Date(tripData.startDate).toLocaleDateString()}</span>
                    {tripData.endDate && (
                      <span> - {new Date(tripData.endDate).toLocaleDateString()}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          {budget > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Progress</span>
                <span className={budgetStatus.color}>{budgetUsed.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(budgetUsed, 100)} 
                className="h-3"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${totalSpent.toFixed(2)} spent</span>
                <span>${budget.toFixed(2)} total</span>
              </div>
            </div>
          )}

          {/* Budget Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <DollarSign className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-xs text-gray-600">Total Budget</p>
              <p className="font-semibold">${budget.toFixed(2)}</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="text-xs text-gray-600">Total Spent</p>
              <p className="font-semibold">${totalSpent.toFixed(2)}</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <TrendingDown className={`w-6 h-6 mx-auto mb-1 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <p className="text-xs text-gray-600">Remaining</p>
              <p className={`font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
            
            {dailyBudget > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-xs text-gray-600">Daily Budget</p>
                <p className="font-semibold">${dailyBudget.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Budget Status Alert */}
          {budget > 0 && (
            <div className={`flex items-center p-3 rounded-lg ${
              budgetUsed <= 70 ? 'bg-green-50' : budgetUsed <= 90 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <StatusIcon className={`w-4 h-4 mr-2 ${budgetStatus.color}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${budgetStatus.color}`}>
                  {budgetUsed <= 70 && "Budget on Track"}
                  {budgetUsed > 70 && budgetUsed <= 90 && "Budget Warning"}
                  {budgetUsed > 90 && budgetUsed <= 100 && "Budget Almost Exceeded"}
                  {budgetUsed > 100 && "Budget Exceeded"}
                </p>
                <p className="text-xs text-gray-600">
                  {budgetUsed <= 70 && "You're managing your budget well!"}
                  {budgetUsed > 70 && budgetUsed <= 90 && "Consider watching your spending in the coming days."}
                  {budgetUsed > 90 && budgetUsed <= 100 && "You're very close to your budget limit."}
                  {budgetUsed > 100 && `You've exceeded your budget by $${(totalSpent - budget).toFixed(2)}.`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryTotals
              .filter(category => category.total > 0)
              .sort((a, b) => b.total - a.total)
              .map(category => {
                const percentage = totalSpent > 0 ? (category.total / totalSpent) * 100 : 0;
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${category.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            
            {categoryTotals.every(category => category.total === 0) && (
              <p className="text-center text-gray-500 py-4">No expenses recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BudgetOverview;