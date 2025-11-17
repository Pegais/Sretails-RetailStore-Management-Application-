import React from 'react';
import {
  Card, CardMedia, CardContent, Typography, Chip, Stack, Box, Divider, Tooltip,
} from '@mui/material';

const InventoryItemCard = ({ item }) => {
  const {
    itemName,
    brand,
    category,
    quantity,
    unit,
    specifications,
    price,
    description,
    tags,
    images,
    addedAt,
  } = item;

  // Format age
  const daysInInventory = Math.floor((Date.now() - new Date(addedAt)) / (1000 * 60 * 60 * 24));
  function roundToTwoDecimalPlaces(num) {
  return Math.round(num * 100) / 100;
}

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        p: 2,
        mb: 3,
        boxShadow: 4,
        borderRadius: 5,
        background: 'linear-gradient(to left, #D1F0ED, #F0F8FA)',
      }}
    >
      {/* 🖼 Image */}
      <CardMedia
        component="img"
        sx={{
          width: { xs: '100%', sm: 300 },
          height: 160,
          borderRight:1,
          borderLeft:1,
          borderRadius: 4,
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
        image={images?.[0] || '/placeholder.png'}
        alt={itemName}
      />

      {/* 📦 Content */}
      <CardContent sx={{ flex: 1, pl: { sm: 3 }, pt: { xs: 2, sm: 0 } }}>
        {/* 🏷 Title + Brand */}
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#333',textTransform:'uppercase' }}>
            {itemName}
          </Typography>
          <Chip label={brand} variant="outlined" sx={{ fontWeight: 800, color: 'darkgreen',textTransform:'uppercase' }} />
        </Box>

        {/* 📋 Specs */}
        <Typography variant="body2" sx={{ color: '#555' }}>
          {[
            specifications?.variant,
            specifications?.color,
            specifications?.material,
            specifications?.size,
            specifications?.dimensions,
          ]
            .filter(Boolean)
            .join(' | ')}
        </Typography>

        {/* 💰 Price Details */}
        <Stack direction="row" spacing={2} alignItems="center" mt={1}>
          <Typography variant="body1" fontWeight="bold" color="primary">
            ₹{price.sellingPrice || 0}
          </Typography>
         
          {
            price.sellingPrice && price.sellingPrice !== price.mrp ?
            <>
            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'gray' }}>
            ₹{price.mrp}
          </Typography>
          <Typography variant="caption" color="success.main">
            You save ₹{roundToTwoDecimalPlaces(price.mrp - price.sellingPrice)}
          </Typography>
            </>
          :
           <Typography variant="caption" color="success.main">
            {price.mrp}
          </Typography>
            
          }
        </Stack>

        {/* 📦 Quantity */}
        <Typography variant="body2" mt={1}>
          In Stock: <strong>{quantity}</strong> {unit}
        </Typography>

        {/* 🧠 Tags */}
        {tags?.length > 0 && (
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {tags.slice(0, 4).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        {/* 🕒 Age */}
        <Divider sx={{ my: 1 }} />
        <Tooltip title="Days in Inventory">
          <Typography variant="caption" color="text.secondary">
            🕒 {daysInInventory} days in stock
          </Typography>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default InventoryItemCard;
