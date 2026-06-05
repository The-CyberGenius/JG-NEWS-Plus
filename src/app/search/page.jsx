import React, { Suspense } from 'react';
import SearchResults from '../../views/SearchResults';
export default function Page() { return <Suspense fallback={<div>Loading...</div>}><SearchResults /></Suspense>; }