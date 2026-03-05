from typing import List, Dict, Any

def calculate_delay_propagation(layers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Simulates how a delay in early phases cascades into later phases using explicit multipliers.
    Requires list of generic dictionaries representing Layer data sorted by sequence (1-9).
    
    Rules:
    - Supply Delay = Base Supply Delay + (Engineering Delay * 1.5)
    - Foundation Delay = Base Foundation Delay + (Supply Delay * 2.0) 
    - Right of Way (Land Acquisition) = Base * 3.0 (if standalone delayed)
    """
    
    # Deep copy to not mutate input
    updated_layers = [layer.copy() for layer in layers]
    
    # Sort just in case
    updated_layers.sort(key=lambda x: x['sequence'])
    
    # 1: Engineering, 2: Supply, 3: Land Acquisition, 4: Leveling, 5: Excavation, 
    # 6: Concreting/Foundation, 7: Erection, 8: Testing, 9: Commissioning
    
    # Pass 1: Raw Delay Calculation
    for layer in updated_layers:
        actual = layer.get('actual_duration_days')
        planned = layer.get('planned_duration_days', 0)
        layer['base_delay'] = max(0, actual - planned) if actual is not None else 0
        layer['cascading_delay'] = 0 
        layer['total_delay_impact'] = layer['base_delay']
        
    def get_layer(seq: int) -> Dict[str, Any]:
        return next((l for l in updated_layers if l['sequence'] == seq), None)
        
    # Layer 1: Engineering Delay impacts Layer 2 (Supply)
    engineering = get_layer(1)
    supply = get_layer(2)
    
    if engineering and supply:
        eng_delay = engineering['total_delay_impact']
        supply['cascading_delay'] += int(eng_delay * 1.5)
        supply['total_delay_impact'] = supply['base_delay'] + supply['cascading_delay']
        
    # Layer 2: Supply Delay impacts Layer 6 (Concreting/Foundation)
    foundation = get_layer(6)
    if supply and foundation:
        sup_delay = supply['total_delay_impact']
        foundation['cascading_delay'] += int(sup_delay * 2.0)
        foundation['total_delay_impact'] = foundation['base_delay'] + foundation['cascading_delay']
        
    # Layer 3: Land Acquisition carries 3.0x multiplier itself
    land_acq = get_layer(3)
    if land_acq:
        land_acq['total_delay_impact'] = int(land_acq['base_delay'] * 3.0)
        
    # Standard ripple effect for strict sequence
    # If a layer is delayed, fundamentally the NEXT layer's start date is pushed back.
    # We calculate accumulative start pushes.
    cumulative_push = 0
    
    for layer in updated_layers:
        layer['start_push_days'] = cumulative_push
        
        # Calculate new actual duration factoring in cascading effects
        current_actual = layer.get('actual_duration_days')
        planned = layer.get('planned_duration_days', 0)
        
        if current_actual is None:
            # If not started, it takes planned + its cascading delay
            computed_duration = planned + layer['cascading_delay']
            layer['projected_duration_days'] = computed_duration
            cumulative_push += layer['total_delay_impact']
        else:
            # If done/in progress, use the real actual + extra cascading
            layer['projected_duration_days'] = max(current_actual, planned + layer['total_delay_impact'])
            # Only push downstream if this phase pushed past its target
            cumulative_push += max(0, layer['projected_duration_days'] - planned)
            
    return updated_layers
