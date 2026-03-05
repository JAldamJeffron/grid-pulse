from datetime import datetime
import json

def check_autonomous_events(current_date_str: str, location: str, base_budget: float, daily_overhead: float):
    """
    Checks for external macro-factors based on the current simulation date.
    Returns any active autonomous delays, cost overruns, and exactly formatted log messages.
    """
    
    try:
        current_date = datetime.strptime(current_date_str, "%Y-%m-%d")
    except ValueError:
        return {"events": [], "total_delay_days": 0, "total_cost_overrun": 0}
        
    events = []
    total_delay_days = 0
    total_cost_overrun = 0.0

    month = current_date.month
    day = current_date.day
    
    # 1. Environmental / Weather (Monsoons/Floods in July/August)
    # Trigger if month is July (7) or August (8) and it's around the 10th of the month.
    if month in [7, 8] and day == 10:
        delay = 45 # 45 days delay for heavy monsoon
        cost = int(delay * daily_overhead)
        total_delay_days += delay
        total_cost_overrun += cost
        events.append({
            "type": "ENVIRONMENTAL",
            "message": f"SEVERE WEATHER: Heavy monsoons and flooding detected in {location or 'the region'}. Phase 6 (Excavation) and Phase 7 (Foundation) halted due to waterlogging.",
            "impact_text": f"+{delay} Days Delay, +₹{(cost/100000):.2f} Lakhs",
            "delay_days": delay,
            "cost_overrun": cost
        })

    # 2. Financial / Commodity Markets 
    # Trigger a steel spike on the 15th of March or September
    if month in [3, 9] and day == 15:
        # 15% spike in supply costs (assuming supply is roughly 30% of base budget)
        supply_budget = base_budget * 0.30
        cost = int(supply_budget * 0.15)
        total_cost_overrun += cost
        events.append({
            "type": "FINANCIAL",
            "message": f"MARKET ALERT: Global Commodity Index shows a sudden +15% spike in Steel and Copper prices. Phase 5 (Supply) procurement costs have been automatically adjusted.",
            "impact_text": f"+₹{(cost/100000):.2f} Lakhs Overrun",
            "delay_days": 0,
            "cost_overrun": cost
        })

    # 3. Worldly Affairs / Force Majeure
    # Geopolitical trigger on November 5th
    if month == 11 and day == 5:
        # Instant 3.0x multiplier on supply delay (assume 30 days base delay -> 90 days cascade)
        delay = 90
        cost = int(delay * daily_overhead)
        total_delay_days += delay
        total_cost_overrun += cost
        events.append({
            "type": "GEOPOLITICAL",
            "message": "GLOBAL EVENT: Red Sea supply chain disrupted due to geopolitical conflict. Cargo ships rerouted. Instant 3.0x multiplier applied to Phase 5 (Supply) and Phase 8 (Erection).",
            "impact_text": f"+{delay} Days Cascade, +₹{(cost/100000):.2f} Lakhs",
            "delay_days": delay,
            "cost_overrun": cost
        })
        
    return {
        "events": events,
        "total_delay_days": total_delay_days,
        "total_cost_overrun": total_cost_overrun
    }
