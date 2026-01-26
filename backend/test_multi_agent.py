"""
Test script for Multi-Agent Orchestration System
Tests overfishing agent, fisheries agent, and orchestrator routing
"""

import sys
import os
sys.path.append(os.getcwd())

print("=" * 60)
print("MULTI-AGENT ORCHESTRATION TEST SUITE")
print("=" * 60)

# Test 1: Overfishing Agent - Overfishing Detected
print("\n\n🧪 TEST 1: Overfishing Agent - Overfishing Detected")
print("-" * 60)

from Agents.overfishing_agent import analyze_overfishing

test_data_1 = {
    'date': '2024-01',
    'stock_volume': 20000,
    'catch_volume': 5000  # 25% > 20% threshold
}

print(f"Input: {test_data_1}")
result_1 = analyze_overfishing(test_data_1)
print(f"\nStatus: {result_1['status']}")
print(f"Catch Percentage: {result_1['catch_percentage']}%")
print(f"Threshold: {result_1['threshold']}")
print(f"Is Overfishing: {result_1['is_overfishing']}")

if 'rag_insights' in result_1:
    print(f"\n📚 RAG Insights (from overfishing collection):")
    print(result_1['rag_insights'][:500] + "..." if len(result_1['rag_insights']) > 500 else result_1['rag_insights'])
    print("\n✅ TEST 1 PASSED: RAG insights retrieved from overfishing collection")
else:
    print("\n❌ TEST 1 FAILED: No RAG insights found")

# Test 2: Overfishing Agent - Healthy Fishing
print("\n\n🧪 TEST 2: Overfishing Agent - Healthy Fishing")
print("-" * 60)

test_data_2 = {
    'date': '2024-02',
    'stock_volume': 20000,
    'catch_volume': 2000  # 10% < 20% threshold
}

print(f"Input: {test_data_2}")
result_2 = analyze_overfishing(test_data_2)
print(f"\nStatus: {result_2['status']}")
print(f"Catch Percentage: {result_2['catch_percentage']}%")
print(f"Is Overfishing: {result_2['is_overfishing']}")

if not result_2['is_overfishing'] and 'rag_insights' not in result_2:
    print("\n✅ TEST 2 PASSED: No RAG search triggered for healthy fishing")
else:
    print("\n❌ TEST 2 FAILED: Unexpected behavior")

# Test 3: Fisheries Agent - Species Query
print("\n\n🧪 TEST 3: Fisheries Agent - Species Query")
print("-" * 60)

from Agents.fisheries_agent import analyze_fish_species

species_name = "Atlantic Salmon"
print(f"Querying species: {species_name}")
result_3 = analyze_fish_species(species_name)

print(f"\nSpecies: {result_3['species']}")
print(f"Data Source: {result_3['data_source']}")

if 'biological_info' in result_3:
    print(f"\n📚 Biological Info (from fisheries collection):")
    print(result_3['biological_info'][:500] + "..." if len(result_3['biological_info']) > 500 else result_3['biological_info'])
    print("\n✅ TEST 3 PASSED: Species information retrieved from fisheries collection")
else:
    print("\n❌ TEST 3 FAILED: No biological info found")

# Test 4: Orchestrator - Auto Routing (Telemetry)
print("\n\n🧪 TEST 4: Orchestrator - Auto Routing (Telemetry)")
print("-" * 60)

from Agents.orchestrator import auto_route

telemetry_input = {
    'stock_volume': 15000,
    'catch_volume': 4000,
    'date': '2024-03'
}

print(f"Input: {telemetry_input}")
result_4 = auto_route(telemetry_input)

print(f"\nRouted to: {result_4.get('agent', 'ERROR')}")
print(f"Input Type: {result_4.get('input_type', 'ERROR')}")

if result_4.get('agent') == 'OverfishingAgent':
    print("\n✅ TEST 4 PASSED: Correctly routed to OverfishingAgent")
else:
    print("\n❌ TEST 4 FAILED: Incorrect routing")

# Test 5: Orchestrator - Auto Routing (Species)
print("\n\n🧪 TEST 5: Orchestrator - Auto Routing (Species)")
print("-" * 60)

species_input = {
    'species': 'Tuna',
    'confidence': 85.5
}

print(f"Input: {species_input}")
result_5 = auto_route(species_input)

print(f"\nRouted to: {result_5.get('agent', 'ERROR')}")
print(f"Input Type: {result_5.get('input_type', 'ERROR')}")

if result_5.get('agent') == 'FisheriesAgent':
    print("\n✅ TEST 5 PASSED: Correctly routed to FisheriesAgent")
else:
    print("\n❌ TEST 5 FAILED: Incorrect routing")

# Test 6: Data Isolation Verification
print("\n\n🧪 TEST 6: Data Isolation Verification")
print("-" * 60)

print("Checking that agents don't cross-contaminate data...")

# Query overfishing agent - should NOT return fish biology
overfishing_query_result = analyze_overfishing({
    'date': '2024-04',
    'stock_volume': 10000,
    'catch_volume': 3000
})

# Query fisheries agent - should NOT return FAO policy
fisheries_query_result = analyze_fish_species("Cod")

print("\nOverfishing Agent RAG Insights (should be policy/legal):")
if 'rag_insights' in overfishing_query_result:
    insights = overfishing_query_result['rag_insights'].lower()
    has_policy_terms = any(term in insights for term in ['fao', 'regulation', 'legal', 'policy', 'sustainable'])
    has_biology_terms = any(term in insights for term in ['habitat', 'species', 'biology', 'ecosystem'])
    
    if has_policy_terms:
        print("✅ Contains policy/legal terms")
    if has_biology_terms:
        print("⚠️ WARNING: May contain biology terms (possible data overlap)")

print("\nFisheries Agent RAG Insights (should be biology/habitat):")
if 'biological_info' in fisheries_query_result:
    bio_info = fisheries_query_result['biological_info'].lower()
    has_biology_terms = any(term in bio_info for term in ['habitat', 'species', 'conservation', 'ocean', 'fish'])
    has_policy_terms = any(term in bio_info for term in ['fao', 'regulation', 'legal', 'policy'])
    
    if has_biology_terms:
        print("✅ Contains biology/habitat terms")
    if has_policy_terms:
        print("⚠️ WARNING: May contain policy terms (possible data overlap)")

print("\n" + "=" * 60)
print("TEST SUITE COMPLETE")
print("=" * 60)
