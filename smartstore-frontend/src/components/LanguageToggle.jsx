import { useState } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'
import CheckIcon from '@mui/icons-material/Check'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
]

const LanguageToggle = () => {
  const { i18n, t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode)
    handleClose()
  }

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  return (
    <>
      <Tooltip title={t('common.language', 'Language')}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <LanguageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
          >
            <ListItemText
              primary={language.nativeName}
              secondary={language.name}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: i18n.language === language.code ? 600 : 400,
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
              }}
            />
            {i18n.language === language.code && (
              <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageToggle

