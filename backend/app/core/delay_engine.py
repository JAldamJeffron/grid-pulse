from typing import List, Dict, Any

class Layer:
    def __init__(self, id: int, name: str, planned_duration: int, actual_duration: int, 
                 planned_monthly_workload: float, completed_workload: float):
        self.id = id
        self.name = name
        self.planned_duration = planned_duration
        self.actual_duration = actual_duration
        self.planned_monthly_workload = planned_monthly_workload
        self.completed_workload = completed_workload
        self.delay = max(0, actual_duration - planned_duration)
        self.propagated_delay = 0

def calculate_delay_propagation(layers: List[Layer], external_factors: Dict[str, Any] = None) -> List[Layer]:
    """
    Business Logic 2: Recursive Delay Propagation Engine
    Calculates the exponential cascading delay on downstream layers.
    """
    if external_factors is None:
        external_factors = {}
        
    # Create layer lookup
    layer_map = {layer.name: layer for layer in layers}
    
    # 1. Engineering
    eng_layer = layer_map.get("Engineering")
    eng_delay = eng_layer.delay if eng_layer else 0
    if eng_layer:
        eng_layer.propagated_delay = eng_delay

    # 2. Supply
    supply_layer = layer_map.get("Supply")
    base_supply_delay = supply_layer.delay if supply_layer else 0
    
    # Apply multiplier: Base Supply Delay + (Engineering Delay * 1.5)
    vendor_impact = external_factors.get("vendor_risk_reduction", 0) # e.g. 0.18 for 18% reduction
    propagated_supply_delay = base_supply_delay + (eng_delay * 1.5)
    if vendor_impact > 0:
        propagated_supply_delay *= (1 - vendor_impact)
        
    if supply_layer:
        supply_layer.propagated_delay = propagated_supply_delay
        
    # 3. Land Acquisition
    land_layer = layer_map.get("Land Acquisition")
    base_land_delay = land_layer.delay if land_layer else 0
    
    # Apply multiplier: ROW / Land Acquisition: 3.0x
    propagated_land_delay = base_land_delay * 3.0
    if land_layer:
        land_layer.propagated_delay = propagated_land_delay
        
    # 4. Leveling
    leveling_layer = layer_map.get("Leveling")
    base_level_delay = leveling_layer.delay if leveling_layer else 0
    propagated_level_delay = base_level_delay + propagated_land_delay
    if leveling_layer:
        leveling_layer.propagated_delay = propagated_level_delay
        
    # 5. Excavation
    excavation_layer = layer_map.get("Excavation")
    base_exc_delay = excavation_layer.delay if excavation_layer else 0
    
    # External factor: Terrain (Hilly = 1.2x multiplier to excavation delay)
    terrain_multiplier = 1.2 if external_factors.get("terrain") == "Hilly" else 1.0
    propagated_exc_delay = (base_exc_delay + propagated_level_delay) * terrain_multiplier
    if excavation_layer:
        excavation_layer.propagated_delay = propagated_exc_delay
        
    # 6. Concreting/Foundation
    foundation_layer = layer_map.get("Concreting/Foundation")
    base_foundation_delay = foundation_layer.delay if foundation_layer else 0
    
    # Apply multiplier: Base Foundation Delay + (Supply Delay * 2.0)
    propagated_foundation_delay = base_foundation_delay + (propagated_supply_delay * 2.0)
    
    # Foundation also depends on Excavation, so take max delay path
    propagated_foundation_delay = max(propagated_foundation_delay, propagated_exc_delay)
    
    # External factor: Heavy Monsoon adds 45 days
    if external_factors.get("heavy_monsoon", False):
        propagated_foundation_delay += 45
        
    if foundation_layer:
        foundation_layer.propagated_delay = propagated_foundation_delay
        
    # 7. Erection
    erection_layer = layer_map.get("Erection")
    base_erection_delay = erection_layer.delay if erection_layer else 0
    propagated_erection_delay = base_erection_delay + propagated_foundation_delay
    if erection_layer:
        erection_layer.propagated_delay = propagated_erection_delay
        
    # 8. Testing
    testing_layer = layer_map.get("Testing")
    base_testing_delay = testing_layer.delay if testing_layer else 0
    propagated_testing_delay = base_testing_delay + propagated_erection_delay
    if testing_layer:
        testing_layer.propagated_delay = propagated_testing_delay
        
    # 9. Commissioning
    commissioning_layer = layer_map.get("Commissioning")
    base_comm_delay = commissioning_layer.delay if commissioning_layer else 0
    propagated_comm_delay = base_comm_delay + propagated_testing_delay
    if commissioning_layer:
        commissioning_layer.propagated_delay = propagated_comm_delay
        
    return list(layer_map.values())

def calculate_workload_accelerator(base_monthly_target: float, previous_month_planned: float, previous_month_actual: float) -> float:
    """
    Business Logic 1: The Workload Accelerator
    Rule: NextMonthRequiredWork = BaseMonthlyTarget + (PreviousMonthPlanned - PreviousMonthActual)
    """
    deficit = previous_month_planned - previous_month_actual
    next_month_req = base_monthly_target + max(0, deficit)
    return next_month_req
