import type { Metadata } from 'next'
import { Presentation } from '@/components/present/Presentation'

export const metadata: Metadata = {
  title: 'Vigil — presentation',
  description: 'A slide-by-slide tour of the Vigil predictive-maintenance project, narrated by its own 3D test bench.',
}

export default function PresentPage() {
  return <Presentation />
}
