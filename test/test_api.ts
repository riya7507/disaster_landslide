import assert from 'assert';
import { predictLandslideRisk } from '../server/ml';
import { evaluateImpactAndPriority } from '../server/gis';
import { getDatabase, initDatabase } from '../server/db';

console.log('Running LANDGUARD Automated Acceptance Tests...');

// 1. Test Database Initialization
initDatabase();
const db = getDatabase();
assert(db.riskZones.length >= 10, 'Risk zones must be seeded');
assert(db.villages.length >= 10, 'Villages must be seeded');
assert(db.roads.length >= 4, 'Lifeline roads must be seeded');
assert(db.fieldReports.length >= 3, 'Field reports must be seeded');
console.log('✓ Database initialization & seeding passed.');

// 2. Test ML Landslide Risk Model
const criticalTest = predictLandslideRisk({
  rainfall24h: 150,
  rainfall7d: 380,
  soilMoisture: 92,
  slope: 45,
  historicalEventsCount: 5,
});
assert(criticalTest.probability >= 0.80, 'High rainfall and steep slope must trigger CRITICAL risk');
assert(criticalTest.riskCategory === 'CRITICAL', 'Category must be CRITICAL');
assert(criticalTest.contributors.length >= 4, 'Contributors must be generated for Explainable AI');
console.log(`✓ ML Model prediction test passed (Critical Prob: ${criticalTest.probability}).`);

const lowTest = predictLandslideRisk({
  rainfall24h: 5,
  rainfall7d: 15,
  soilMoisture: 35,
  slope: 12,
  historicalEventsCount: 0,
});
assert(lowTest.probability <= 0.30, 'Low rainfall and gentle slope must trigger LOW risk');
assert(lowTest.riskCategory === 'LOW', 'Category must be LOW');
console.log(`✓ ML Model low risk prediction test passed (Low Prob: ${lowTest.probability}).`);

// 3. Test GIS Impact & Priority Calculation
const impactTest = evaluateImpactAndPriority(
  'test_zone',
  27.38,
  88.53,
  2.0,
  0.92,
  db.villages,
  db.roads,
  db.infrastructure
);
assert(impactTest.priorityLevel === 'P1', 'High probability near key villages and NH-10 should yield P1 priority');
assert(impactTest.affectedVillages.length > 0, 'Should find nearby affected villages');
assert(impactTest.priorityScore >= 70, 'Priority score should be >= 70');
console.log(`✓ GIS Impact & Priority engine test passed (Priority: ${impactTest.priorityLevel}, Score: ${impactTest.priorityScore}).`);

console.log('ALL CORE ENGINE ACCEPTANCE TESTS PASSED SUCCESSFULLY! ✓✓✓');
