import React from 'react'
import Link from 'next/link'

export const CustomHeader = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px' }}>
      <Link href="/" aria-label="Back to home">
        <button className="px-3 py-2 bg-black text-white rounded-md hover:bg-[#fab803]">Back to Home</button>
      </Link>
    </div>
  )
}

export default CustomHeader
