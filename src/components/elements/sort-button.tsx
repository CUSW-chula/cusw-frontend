import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const SortBotton = () => {
  return (
    <div>
    <Select>
    <SelectTrigger className="w-[200px] font-BaiJamjuree text-brown border-[#6b5c56] outline-none focus:ring-none ring-offset-transparent focus:ring-offset-transparent ">
      <SelectValue
        placeholder="Sort By: Start Date"
      />
    </SelectTrigger>
    <SelectContent className='font-BaiJamjuree text-brown'>
      <SelectItem value="Start Date">Sort by: Start date</SelectItem>
      <SelectItem value="End Date">Sort by: End date</SelectItem>
      <SelectItem value="Highest">Sort by: Highest budget</SelectItem>
      <SelectItem value="Lowest">Sort by: Lowest budget</SelectItem>

    </SelectContent>
  </Select></div>
  )
}

export default SortBotton