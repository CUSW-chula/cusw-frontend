import React from 'react'
import { Button } from '../ui/button'
const Createproject = () => {
  return (
    <div><a href='/projectdetail'>
      <Button
        variant="outline"
        className="flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md font-BaiJamjuree">
        + New Project
      </Button>
      </a>
    </div>
  )
}

export default Createproject