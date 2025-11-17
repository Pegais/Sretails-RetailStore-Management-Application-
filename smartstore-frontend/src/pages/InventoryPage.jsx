import { useEffect, useState } from "react"
import InventoryItemCard from "../components/layouts/inventoryCard"
import { Box, Typography } from "@mui/material"
import axiosInstance from "../api/axiosInstance"
import AnimatedInventoryList from "./AnimatedInventoryList"

const InventoryPage = () => {
  const [items, setItems] = useState([])

  useEffect(() => {
    axiosInstance.get('/api/inventory')
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <Box>
      <Typography variant="h5" sx={{ mb:2, fontWeight: 600, color: 'olive' }}>
        MY  INVENTORY
      </Typography>

      
       {
        items?.length && items.map((item)=>(
          <InventoryItemCard key={item.id} item={item} />
        ))
        
        
       
        
      } 
    
    </Box>
  )
}

export default InventoryPage