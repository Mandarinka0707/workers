import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface VacancyFilterProps {
  filters: {
    title: string;
    location: string;
    salary: string;
    status: string;
  };
  onFilterChange: (name: string, value: string) => void;
}

const VacancyFilter: React.FC<VacancyFilterProps> = ({ filters, onFilterChange }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Фильтры</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Название вакансии"
          value={filters.title}
          onChange={(e) => onFilterChange('title', e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Локация"
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Зарплата"
          value={filters.salary}
          onChange={(e) => onFilterChange('salary', e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MoneyIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: '200px' }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={filters.status}
            label="Статус"
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="active">Активные</MenuItem>
            <MenuItem value="archived">В архиве</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default VacancyFilter; 