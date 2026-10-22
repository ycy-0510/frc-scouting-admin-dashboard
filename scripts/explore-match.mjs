// Script to explore /matches/{teamNum} subcollections
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./firebase-account.json', 'utf-8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function exploreMatchesDetail() {
  const teamNum = '8020';
  console.log(`Exploring /matches/${teamNum}...\n`);
  
  // Get document data
  const teamDoc = await db.collection('matches').doc(teamNum).get();
  if (teamDoc.exists) {
    console.log('Document data:', JSON.stringify(teamDoc.data(), null, 2));
  }
  
  // List subcollections
  const subcollections = await db.collection('matches').doc(teamNum).listCollections();
  console.log('\nSubcollections:');
  
  for (const subcol of subcollections) {
    console.log(`\n=== Subcollection: ${subcol.id} ===`);
    
    // Get sample documents
    const docs = await subcol.limit(3).get();
    docs.forEach(doc => {
      console.log(`\nDocument ${doc.id}:`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }
}

exploreMatchesDetail()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
