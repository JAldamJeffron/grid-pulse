def calculate_next_month_target(base_monthly_target: float, previous_month_planned: float, previous_month_actual: float) -> float:
    """
    Calculates the revised workload target for the next month.
    Rule: NextMonthRequiredWork = BaseMonthlyTarget + (PreviousMonthPlanned - PreviousMonthActual)
    
    If Actual > Planned (ahead of schedule), the next month target goes down.
    If Actual < Planned (behind schedule), the next month target goes up.
    """
    
    deficit = previous_month_planned - previous_month_actual
    next_target = base_monthly_target + deficit
    
    # Cannot be negative workload
    return max(0.0, next_target)
