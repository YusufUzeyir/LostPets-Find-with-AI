import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import FilterListIcon from '@mui/icons-material/FilterList';

const LostPets = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filtre state'leri
  const [filters, setFilters] = useState({
    tur: '',
    cins: '',
    sehir: '',
    ilce: ''
  });

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Türleri getir
        const typesResponse = await fetch('http://localhost:5000/api/pets/types');
        const typesData = await typesResponse.json();
        setTypes(typesData);

        // Şehirleri getir
        const citiesResponse = await fetch('http://localhost:5000/api/pets/cities');
        const citiesData = await citiesResponse.json();
        setCities(citiesData);

        // İlanları getir
        const petsResponse = await fetch('http://localhost:5000/api/pets/lost');
        const petsData = await petsResponse.json();
        setPets(petsData);
        setFilteredPets(petsData);
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tür değiştiğinde cinsleri getir
  useEffect(() => {
    const fetchBreeds = async () => {
      if (filters.tur) {
        try {
          const response = await fetch(`http://localhost:5000/api/pets/breeds/${filters.tur}`);
          const data = await response.json();
          setBreeds(data);
        } catch (error) {
          console.error('Cins getirme hatası:', error);
        }
      } else {
        setBreeds([]);
        setFilters(prev => ({ ...prev, cins: '' }));
      }
    };

    fetchBreeds();
  }, [filters.tur]);

  // Şehir değiştiğinde ilçeleri getir
  useEffect(() => {
    const fetchDistricts = async () => {
      if (filters.sehir) {
        try {
          const response = await fetch(`http://localhost:5000/api/pets/districts/${filters.sehir}`);
          const data = await response.json();
          setDistricts(data);
        } catch (error) {
          console.error('İlçe getirme hatası:', error);
        }
      } else {
        setDistricts([]);
        setFilters(prev => ({ ...prev, ilce: '' }));
      }
    };

    fetchDistricts();
  }, [filters.sehir]);

  // Filtreleme işlemi
  useEffect(() => {
    let filtered = [...pets];

    if (filters.tur) {
      filtered = filtered.filter(pet => pet.tur === parseInt(filters.tur));
    }
    if (filters.cins) {
      filtered = filtered.filter(pet => pet.cins === parseInt(filters.cins));
    }
    if (filters.sehir) {
      filtered = filtered.filter(pet => pet.city_id === parseInt(filters.sehir));
    }
    if (filters.ilce) {
      filtered = filtered.filter(pet => pet.district_id === parseInt(filters.ilce));
    }

    setFilteredPets(filtered);
  }, [filters, pets]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      tur: '',
      cins: '',
      sehir: '',
      ilce: ''
    });
  };

  const handleContactClick = (receiverEmail) => {
    if (!user) {
      Swal.fire({
        title: 'Uyarı!',
        text: 'Mesaj göndermek için giriş yapmalısınız.',
        icon: 'warning',
        confirmButtonColor: '#2196f3',
        confirmButtonText: 'Giriş Yap'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    navigate('/messages', { state: { receiver: receiverEmail } });
  };

  const handleCardClick = (petId) => {
    navigate(`/pet/lost/${petId}`);
  };

  const FilterDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    >
      <Box sx={{ width: 300, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtreleme
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Tür</InputLabel>
          <Select
            name="tur"
            value={filters.tur}
            label="Tür"
            onChange={handleFilterChange}
          >
            <MenuItem value="">Tümü</MenuItem>
            {types.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.tur_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }} disabled={!filters.tur}>
          <InputLabel>Cins</InputLabel>
          <Select
            name="cins"
            value={filters.cins}
            label="Cins"
            onChange={handleFilterChange}
          >
            <MenuItem value="">Tümü</MenuItem>
            {breeds.map((breed) => (
              <MenuItem key={breed.id} value={breed.id}>
                {breed.cins_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Şehir</InputLabel>
          <Select
            name="sehir"
            value={filters.sehir}
            label="Şehir"
            onChange={handleFilterChange}
          >
            <MenuItem value="">Tümü</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }} disabled={!filters.sehir}>
          <InputLabel>İlçe</InputLabel>
          <Select
            name="ilce"
            value={filters.ilce}
            label="İlçe"
            onChange={handleFilterChange}
          >
            <MenuItem value="">Tümü</MenuItem>
            {districts.map((district) => (
              <MenuItem key={district.id} value={district.id}>
                {district.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleResetFilters}
          sx={{ mt: 3 }}
        >
          Filtreleri Sıfırla
        </Button>
      </Box>
    </Drawer>
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Kayıp Hayvanlar
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Kayıp dostlarımızı bulabilmek için yardımınıza ihtiyacımız var
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Filtrele">
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/report-lost')}
          >
            Kayıp İlanı Ver
          </Button>
        </Box>
      </Box>

      <FilterDrawer />

      {filteredPets.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {pets.length === 0 ? 'Henüz kayıp hayvan ilanı bulunmuyor.' : 'Filtrelere uygun ilan bulunamadı.'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredPets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out'
                  }
                }}
                onClick={() => handleCardClick(pet.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={pet.lost_image || '/default-pet.jpg'}
                  alt={`${pet.tur_name || 'Bilinmiyor'} ${pet.cins_name || 'Bilinmiyor'}`}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<PetsIcon />}
                      label={`${pet.tur_name || 'Bilinmiyor'} - ${pet.cins_name || 'Bilinmiyor'}`}
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                      {pet.sehir}, {pet.ilce}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
                      {new Date(pet.kaybolma_tarihi).toLocaleDateString('tr-TR')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                      {pet.adsoyad}
                    </Typography>
                  </Box>

                  {user && user.user.email !== pet.email && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactClick(pet.email);
                      }}
                    >
                      İletişime Geç
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LostPets; 