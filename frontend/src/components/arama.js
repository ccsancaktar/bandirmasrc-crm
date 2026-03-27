import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Box } from '@mui/material';

const Arama = ({ onSearch }) => {
  const [searchType, setSearchType] = useState('isim');
  const [query, setQuery] = useState('');
  const [lastSearched, setLastSearched] = useState('');

  useEffect(() => {
    if (query.length >= 2 && query !== lastSearched) {
      if (onSearch) {
        onSearch({ type: searchType, value: query });
        setLastSearched(query);
      }
    } else if (query.length < 2 && lastSearched !== '') {
      // Karakter silinirse ve 2'nin altına düşerse sonucu temizle
      if (onSearch) onSearch({ type: searchType, value: '' });
      setLastSearched('');
    }
    // eslint-disable-next-line
  }, [query, searchType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.length >= 2 && onSearch) {
      onSearch({ type: searchType, value: query });
      setLastSearched(query);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        select
        label="Arama Türü"
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        size="small"
      >
        <MenuItem value="isim">İsim</MenuItem>
        <MenuItem value="tc">TC</MenuItem>
      </TextField>
      <TextField
        label={searchType === 'isim' ? 'İsim ile ara' : 'TC ile ara'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        size="small"
      />
      <Button type="submit" variant="contained" disabled={query.length < 2}>
        Ara
      </Button>
    </Box>
  );
};

export default Arama;
