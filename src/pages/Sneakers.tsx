import React from 'react';
import { CollectionTab } from '@/components/collection/CollectionTab';
import { SNEAKERS } from '@/lib/catalogGroups';

const Sneakers: React.FC = () => <CollectionTab group={SNEAKERS} />;

export default Sneakers;
